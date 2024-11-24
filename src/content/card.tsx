import './index.css'
import cardStyles from './card.css?inline'
import { createSignal, createEffect, Show, For, Switch, Match, batch, onMount, onCleanup, createResource } from 'solid-js'
import { customElement } from 'solid-element'
import { classes, Messages, WordContext } from '../constant'
import {
  init as highlightInit,
  unknownHL,
  contextHL,
  getRangeWord,
  markAsKnown,
  markAsAllKnown,
  addContext,
  deleteContext,
  isInDict,
  getWordContexts,
  wordContexts,
  setWordContexts,
  isWordKnownAble,
  zenExcludeWords,
  setZenExcludeWords,
  getWordAllTenses,
  getRangeAtPoint,
  getOriginForm
} from './highlight'
import { getMessagePort } from '../lib/port'
import { Dict } from './dict'
import { adapters, AdapterKey, Adapter } from './adapters'
import { getWordContext, safeEmphasizeWordInText, getFaviconByDomain, settings, explode } from '../lib'
import { readBlacklist } from '../lib/blacklist'
import { markKnown, getKnown } from '../lib'
import { CollinsDict } from './adapters/collins'

let timerShowRef: number
let timerHideRef: number
let inDirecting = false
let rangeRect: DOMRect
let collins: CollinsDict = adapters.collins

const [curWord, setCurWord] = createSignal('')
const [dictHistory, setDictHistory] = createSignal<string[]>([])
const [zenMode, setZenMode] = createSignal(false)
const [zenModeWords, setZenModeWords] = createSignal<string[]>([])
const [cardDisabledInZenMode, setCardDisabledInZenMode] = createSignal(false)
const [curContextText, setCurContextText] = createSignal('')
const [tabIndex, setTabIndex] = createSignal(0)

export const WhCard = customElement('wh-card', () => {
  const dictTabs = () => settings()['dictTabs']
  const availableDicts = () => settings().dictOrder.filter(key => dictTabs()[key as AdapterKey]) as AdapterKey[]
  const adapterName = () => (availableDicts()[tabIndex()] ?? availableDicts()[0]) as AdapterKey
  const getDictAdapter = () => adapters[adapterName()]
  const tabCount = () => availableDicts().length

  const [hideExample, setHideExample] = createSignal(true)

  onMount(() => {
    readBlacklist().then(async blacklist => {
      try {
        if (blacklist.includes(location.host) || blacklist.includes(top?.location.host)) return
      } catch (e) {
        // do nothing, some times the frame is cross origin, and will throw error for `top.location.host`
      }
      await highlightInit()
      bindEvents()
    })
  })

  const [def, { loading }] = createResource(() => {
    return curWord()?.length > 0 ? { word: curWord() } : undefined
  }, collins.lookupD.bind(collins))

  const onKnown = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault()
    const word = curWord()
    markKnown([getOriginForm(word)])
    markAsKnown(word)
    setCurWord('')
    hidePopupDelay(0)
    autoPauseYTB(false)
    if (e instanceof MouseEvent && e.pageX) {
      explode(e.pageX, e.pageY)
    } else {
      explode(rangeRect.left, rangeRect.top)
    }
  }

  const onAddContext = (e: MouseEvent | KeyboardEvent) => {
    if (zenMode()) return false
    e.preventDefault()
    const word = curWord()
    addContext(word, curContextText())
    setTabIndex(tabCount())
  }

  const onCardClick = (e: MouseEvent) => {
    const node = e.target as HTMLElement
    playAudio(node, e)

    if (node.tagName === 'A' && node.dataset.href) {
      e.stopImmediatePropagation()
      const word = getDictAdapter().getWordByHref(node.dataset.href)
      if (word === curWord()) return false

      inDirecting = true
      setCurWord(word)
      setDictHistory([...dictHistory(), word])
      return false
    }

    if (node.tagName === 'A' && node.getAttribute('href') === '#') {
      e.stopImmediatePropagation()
      e.preventDefault()
      getCardNode().querySelector('.dict_container')!.scrollTop = 0
      return false
    }

    if (node.classList.contains('history_back') || node.parentElement?.classList.contains('history_back')) {
      e.stopImmediatePropagation()
      inDirecting = true
      const newHistory = dictHistory().slice(0, -1)
      setDictHistory(newHistory)
      const prevWord = newHistory.at(-1)
      if (prevWord) {
        setCurWord(prevWord)
      }
    }
  }

  const onCardDoubleClick = (e: MouseEvent) => {
    const selection = document.getSelection()
    const word = selection?.toString().trim().toLowerCase()
    if (word && isInDict(word) && word !== curWord()) {
      setCurWord(word)
      setDictHistory([...dictHistory(), word])
    }
  }

  const onDictSettle = (index: number) => {
    if (tabIndex() === index) {
      adjustCardPosition(rangeRect, inDirecting)
      inDirecting = false
      runAutoPronounce()
    }
  }

  const inWordContexts = () => {
    return !!wordContexts().find(c => c.text === curContextText())
  }

  const goYouGlish = () => {
    const word = curWord()
    if (word) {
      getMessagePort().postMessage({ action: Messages.open_youglish, word })
    }
  }

  // for page like calibre, stop the document scroll when mouse wheel on card
  const onWheel = (e: WheelEvent) => {
    e.stopImmediatePropagation()
  }

  const onKeydown = (e: KeyboardEvent) => {
    const cardNode = getCardNode()
    const container = cardNode.querySelector('.dict_container')!
    if (isCardVisible()) {
      if (!e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          const selector = getDictAdapter().sectionSelector
          if (!selector) return
          const sections = container.querySelectorAll(selector) as NodeListOf<HTMLElement>
          const rootMargin = 30
          const firstInViewportIndex = Array.from(sections).findIndex(s => {
            return s.offsetTop > container.scrollTop
          })
          if (e.key === 'ArrowUp') {
            if (firstInViewportIndex > 0) {
              container.scrollTop = sections[firstInViewportIndex - 1].offsetTop - rootMargin
            }
          }
          if (e.key === 'ArrowDown') {
            if (firstInViewportIndex < sections.length - 1) {
              container.scrollTop = sections[firstInViewportIndex + 1].offsetTop - rootMargin
            }
          }
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
          if (e.key === 'ArrowLeft') {
            setTabIndex(tabIndex() > 0 ? tabIndex() - 1 : tabCount())
          }
          if (e.key === 'ArrowRight' || e.key === 'Tab') {
            setTabIndex(tabIndex() < tabCount() ? tabIndex() + 1 : 0)
          }
        }
        if (e.key === 'Escape') {
          hidePopupDelay(0)
        }
        if (e.key === 'a') {
          onKnown(e)
        }
        if (e.key === 's') {
          onAddContext(e)
        }
        e.preventDefault()
      }
    }
  }

  document.addEventListener('keydown', onKeydown)

  onCleanup(() => {
    document.removeEventListener('keydown', onKeydown)
    unbindEvents()
  })

  // auto switch to first tab when context tab is selected and no contexts
  createEffect((prev?: number) => {
    const contexts = wordContexts()
    if (contexts.length === 0 && tabIndex() === tabCount() && prev === tabCount()) {
      setTabIndex(0)
    }
    return tabIndex()
  })

  // 添加一个effect来监听curWord变化
  createEffect(() => {
    const word = curWord()
    if (word && !loading && def()) {
      // 使用 requestAnimationFrame 确保DOM更新完成
      requestAnimationFrame(() => {
        showPopup()
        adjustCardPosition(rangeRect)
      })
    }
  })

  const onGoToDictPage = () => {
    window.open(collins.getPageUrl(curWord()))
  }

  const externalLink = () => {
    if (tabIndex() == tabCount()) return null
    return getDictAdapter().getPageUrl(curWord())
  }

  const onPlayAudio = (url: string) => {
    console.log(url)
    const audio = new Audio(url)
    audio.play()
  }

  return (
    <div class="word_card" onclick={() => { console.log('cccccc') } /*onCardClick*/} ondblclick={onCardDoubleClick} inert>
      <div class="bg-white  w-96 pt-6 pl-6 pr-6 rounded-2xl shadow-lg transform transition duration-300  space-y-4 relative ">
        {loading && (
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="loading-spinner"></div>
          </div>
        )}
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{curWord()}<span class="text-purple-500">✨</span></h2>
            <div class="text-gray-500 text-xs flex items-center space-x-2 mt-1 ">
              <span class=" border border-slate-300 px-0.5 py-0.05  rounded-md">US</span>

              <div class="flex items-center border border-slate-300 rounded-md px-1">
                <button class="mr-1" onclick={() => onPlayAudio(def()?.phonetics?.[0]?.audio)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>

                </button>
                <span>{typeof def() === 'string' ? '' : def()?.phonetics?.[0]?.text}</span>
              </div>
            </div>

            <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <For each={Object.entries(def()?.wordForms ?? {})}>
                {([key, value]) => {
                  if (!value) return null
                  return (
                    <span class="" style="margin-right: 0.5em">
                      {/*<span class="opacity-75 font-semibold">{key}: </span>*/}
                      <span>{value}</span>
                    </span>
                  )
                }}
              </For>
            </div>

            <div class="flex gap-2 h-1 mt-1">
              <span class="h-1 w-2 rounded-full bg-orange-500"></span>
              <span class="h-1 w-2 rounded-full bg-orange-500"></span>
              <span class="h-1 w-2 rounded-full bg-gray-300"></span>
              <span class="h-1 w-2 rounded-full bg-gray-300"></span>
            </div>
          </div>

          <div class="flex space-x-2 text-gray-500 dark:text-gray-400">
            <button class="rounded-full p-1 bg-orange-50 " >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>

            </button>
            <button class="rounded-full p-1 bg-orange-50 " onclick={onKnown}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </button>
          </div>
        </div>




        <div class="pb-2  dark:border-gray-700">
          <div class="flex  items-center text-gray-600 dark:text-gray-400">
            <button>
              <span class="font-bold text-sm">词义</span>
            </button>


            <button class="ml-4">
              <div class="flex space-x-0.5 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <span class="text-sm">视频</span>
              </div>
            </button>

            <button class="ml-auto">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 ">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>

              </div>
            </button>
          </div>

          <div class="explaination h-48 overflow-y-auto border-t mt-1.5 border-slate-300">
            <For each={def()?.meanings ?? []}>
              {({ partOfSpeech, definitions }) => {
                return (
                  <div>

                    <p class="text-gray-800 dark:text-gray-200 mt-2 text-sm ">
                      <span class="font-semibold ">{partOfSpeech}.</span> {definitions[0].definition}
                    </p>
                    <button class="text-blue-500 mt-2 text-sm hover:underline" onclick={() => setHideExample(!hideExample())}>显示例句</button>
                    <div id="examples" class={`text-gray-700 dark:text-gray-300 mt-2  ${hideExample() ? 'hidden' : ''}`}>
                      <p>{definitions[0].example}</p>
                    </div>
                  </div>
                )
              }}
            </For>
          </div>

        </div>

        <div class="flex justify-between text-gray-500 rounded-b-2xl text-sm -m-6 pt-2 pb-2 pl-6 pr-6 bg-slate-100">
          <button class="hover:text-gray-700 dark:hover:text-gray-300" onclick={onGoToDictPage}>
            <div class="flex space-x-1 ">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
              </svg>
              <span>详情</span>
            </div>
          </button>

          <div class="flex space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>

            <button class="hover:text-gray-700 dark:hover:text-gray-300">备注</button>
          </div>

          <div class="flex space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            <button class="hover:text-gray-700 dark:hover:text-gray-300">例句</button>
          </div>
        </div>
        {/*
        <div class="toolbar">
          <div>
            <button disabled={!isWordKnownAble(curWord())} onclick={onKnown} title="known">
              <img src={chrome.runtime.getURL('icons/checked.png')} alt="ok" />
            </button>
            <button onclick={onAddContext} disabled={inWordContexts() || dictHistory().length > 1} title="save context">
              <img
                src={chrome.runtime.getURL(!inWordContexts() ? 'icons/filled-star.png' : 'icons/filled-star.png')}
                alt="save"
              />
            </button>
          </div>
          <div>
            <a target={externalLink() ? '_blank' : '_self'} href={externalLink() || 'javascript:void(0)'}>
              {curWord()}
            </a>
          </div>
          <div>
            <button onClick={goYouGlish} title="youglish">
              <img src={chrome.runtime.getURL('icons/cinema.png')} alt="youglish" />
            </button>
            <button class="history_back" disabled={dictHistory().length < 2} title="back">
              <img src={chrome.runtime.getURL('icons/undo.png')} alt="back" />
            </button>
          </div>
        </div>
        <div class="tabs">
          <div>
            <For each={availableDicts()}>
              {(dictName, i) => (
                <button onclick={() => setTabIndex(i)} classList={{ selected: tabIndex() === i() }}>
                  {dictName}
                </button>
              )}
            </For>
            <button
              onclick={() => setTabIndex(tabCount())}
              classList={{ selected: tabIndex() === tabCount(), hidden: !wordContexts().length }}
            >
              Contexts
            </button>
          </div>
        </div>
        <div class="dict_container" onWheel={onWheel}>
          <Show when={curWord()}>
            <Switch fallback={null}>
              <Match when={tabIndex() === tabCount()}>
                <ContextList contexts={wordContexts()}></ContextList>
              </Match>
              <For each={availableDicts()}>
                {(dictName, i) => (
                  <Match when={tabIndex() === i()}>
                    <Dict
                      word={curWord()}
                      contextText={curContextText()}
                      dictAdapter={getDictAdapter()}
                      onSettle={() => onDictSettle(i())}
                    />
                  </Match>
                )}
              </For>
            </Switch>
          </Show>
        </div>
        <style>{cardStyles}</style>
        <style>{getDictAdapter().style}</style>
      */}
      </div>
      <style>{cardStyles}</style>
    </div>

  )
})

export function ZenMode() {
  const setCardDisabledStatus = (e: InputEvent) => {
    setCardDisabledInZenMode((e.target as HTMLInputElement).checked)
  }

  const _toggleZenMode = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && zenMode() && !isCardVisible()) {
      toggleZenMode()
    }
  }

  document.addEventListener('keydown', _toggleZenMode)
  onCleanup(() => {
    document.removeEventListener('keydown', _toggleZenMode)
  })

  const onWordClick = (e: MouseEvent) => {
    const node = e.target as HTMLElement
    if (e.metaKey || e.ctrlKey) {
      const word = node.dataset.word!
      if (zenExcludeWords().includes(word)) {
        setZenExcludeWords(zenExcludeWords().filter(w => w !== curWord()))
      } else {
        setZenExcludeWords([...zenExcludeWords(), word])
      }
    }
  }

  const onSetAllKnown = () => {
    confirm('Are you sure you want to mark all unknown words on this page as known?') && markAsAllKnown()
  }

  const onUnselectAll = () => {
    if (zenExcludeWords().length > 0) {
      setZenExcludeWords([])
    } else {
      setZenExcludeWords([...zenModeWords()])
    }
  }

  return (
    <Show when={zenMode()}>
      <div class={classes.zen_mode}>
        <div class="zen_close_btn" title="close" onclick={toggleZenMode}>
          <img src={chrome.runtime.getURL('icons/cancel.png')} width="30" height="30" alt="delete" />
        </div>
        <pre>
          <p>
            Note: use <kbd>⌘</kbd> + <kbd>Click</kbd> to unselect word
          </p>
        </pre>
        <div class="zen_buttons">
          <button onclick={onUnselectAll} title="Unselect All">
            <img src={chrome.runtime.getURL('icons/unselect.png')} width="20" height="20" alt="Unselect all words" />
            Unselect All
          </button>
          <button onclick={onSetAllKnown} title="Set all words as known">
            <img src={chrome.runtime.getURL('icons/checked.png')} width="20" height="20" alt="Set all words as known" />
            Set all words as known
          </button>
          <label>
            <input type="checkbox" oninput={setCardDisabledStatus} checked={cardDisabledInZenMode()} />
            disable card popup
          </label>
        </div>
        <div class="zen_words">
          <For each={zenModeWords()}>
            {(word: string) => {
              return (
                <span
                  classList={{ [classes.excluded]: zenExcludeWords().includes(word) }}
                  onclick={onWordClick}
                  data-word={word}
                >
                  {word}
                </span>
              )
            }}
          </For>
        </div>
      </div>
    </Show>
  )
}

function ContextList(props: { contexts: WordContext[] }) {
  const allTensionWords = () => getWordAllTenses(curWord()).reverse()
  return (
    <Show
      when={props.contexts.length > 0}
      fallback={
        <div class="no-contexts">
          <img src={chrome.runtime.getURL('icons/robot.png')} alt="no contexts" />
          no contexts
        </div>
      }
    >
      <div class="contexts">
        <For each={props.contexts.reverse()}>
          {(context: WordContext) => {
            const highlightedContext = safeEmphasizeWordInText(context.text, allTensionWords().join('|'))
            let link =
              context.url + '#:~:text=' + encodeURIComponent(context.text?.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim())
            link = link.replaceAll('-', '%2D')
            return (
              <div>
                <pre innerHTML={highlightedContext}></pre>
                <p>
                  <img src={context.favicon || getFaviconByDomain(context.url)} alt="favicon" />
                  <a href={link} target="_blank">
                    {context.title}
                  </a>
                </p>
                <button title="delete context" onclick={() => deleteContext(context)}>
                  <img src={chrome.runtime.getURL('icons/cancel.png')} alt="delete" />
                </button>
              </div>
            )
          }}
        </For>
      </div>
    </Show>
  )
}

function getCardNode() {
  const root = document.querySelector('wh-card')?.shadowRoot
  return root?.querySelector('.' + classes.card) as HTMLElement
}

const isCardVisible = () => {
  return getCardNode().classList.contains('card_visible')
}

const playAudio = (node: HTMLElement, e?: MouseEvent) => {
  const audioSrc = node?.getAttribute('data-src-mp3') || node?.parentElement?.getAttribute('data-src-mp3')
  if (audioSrc) {
    getMessagePort().postMessage({ action: Messages.play_audio, audio: audioSrc })
    e && e.stopImmediatePropagation()
    node?.classList.add('active')
    setTimeout(() => {
      node?.classList.remove('active')
    }, 1000)
    return false
  }
}

const runAutoPronounce = () => {
  if (isCardVisible() && settings().autoPronounce) {
    // play american english audio first
    let ameNode = getCardNode().querySelector('.amefile[data-src-mp3]')
    if (ameNode) {
      playAudio(ameNode as HTMLElement)
    } else {
      playAudio(getCardNode().querySelector('[data-src-mp3]') as HTMLElement)
    }
  }
}

function hidePopupDelay(ms: number) {
  clearTimerHideRef()
  timerHideRef = window.setTimeout(() => {
    const cardNode = getCardNode()
    cardNode.classList.remove('card_visible')
    cardNode.inert = true
    setDictHistory([])
  }, ms)
}

function clearTimerHideRef() {
  timerHideRef && clearTimeout(timerHideRef)
}

function toggleZenMode() {
  if (!zenMode()) {
    const words = [...unknownHL.values(), ...contextHL.values()].map(range => getRangeWord(range))
    batch(() => {
      setZenModeWords([...new Set(words)])
      setZenExcludeWords([])
    })
  }
  setZenMode(!zenMode())
}

// this function expose to be called in popup page
window.__toggleZenMode = toggleZenMode

function showPopup() {
  if (isCardVisible()) return false
  const dictTabs = () => settings()['dictTabs']
  const availableDicts = () => settings().dictOrder.filter(key => dictTabs()[key as AdapterKey]) as AdapterKey[]
  const tabCount = () => availableDicts().length
  const cardNode = getCardNode()
  if (wordContexts().length > 0) {
    setTabIndex(tabCount())
    // use chrome.tts to pronounce the word in context
    requestIdleCallback(() => {
      getMessagePort().postMessage({ action: Messages.play_audio, audio: null, word: curWord() })
    })
  } else if (tabIndex() === tabCount()) {
    setTabIndex(0)
  }
  cardNode.classList.add('card_visible')
  cardNode.inert = false
  runAutoPronounce()
}

function adjustCardPosition(rect: DOMRect, onlyOutsideViewport = false) {
  const cardNode = getCardNode()
  const { x: x, y: y, width: m_width, height: m_height } = rect
  const { x: c_x, y: c_y, width: c_width, height: c_height } = cardNode.getBoundingClientRect()

  const MARGIN_X = 1
  console.log("xxxxxx")
  console.log(x, y)
  console.log("ccccc")
  console.log(c_x, c_y)

  let left = x + m_width / 2 - c_width / 2
  let top = y - window.innerHeight - 2
  console.log("aaaa")
  console.log(left, top)
  let viewportWidth = window.innerWidth

  // handle iframe overflow
  try {
    if (parent !== self) {
      if (self.top?.innerWidth! < viewportWidth) {
        viewportWidth = self.top?.innerWidth ?? viewportWidth
        parent.document.querySelectorAll('iframe').forEach(iframe => {
          if (iframe.contentWindow === self) {
            const iframeRect = iframe.getBoundingClientRect()
            viewportWidth = viewportWidth - iframeRect.left
          }
        })
      }
    }
  } catch (e) {
    // do nothing
  }

  // if overflow right viewport
  if (left + c_width > viewportWidth) {
    if (x > c_width) {
      left = x - c_width - MARGIN_X
    } else {
      left = viewportWidth - c_width - 30
      top = y + m_height + MARGIN_X
    }
  }
  // if overflow top viewport
  if (top < c_height - window.innerHeight) {
    top = y - (window.innerHeight - c_height) + 2
  }

  if (top + c_height > window.innerHeight) {
    top = window.innerHeight - c_height - MARGIN_X - 10
  }

  //cardNode.style.bottom = `${y + c_height + 3}px`
  //cardNode.style.left = `${left}px`

  if (!onlyOutsideViewport || c_y < 0 || c_y + c_height > window.innerHeight) {
    // cardNode.style.top = `${top}px`
    cardNode.style.transform = `translate(${left}px, ${top}px)`
  }

  if (!onlyOutsideViewport || c_x < 0 || c_x + c_width > viewportWidth) {
    cardNode.style.transform = `translate(${left}px, ${top}px)`
  }
}

let toQuickMarkWord: string
let holdKey: string | null = null
let previous_cusor = document.body.style.cursor

function onMouseMove(e: MouseEvent, silent = false) {
  if (!silent && zenMode() && cardDisabledInZenMode()) {
    return false
  }

  const target = e.target as HTMLElement
  const isInsideCard = isCardVisible() && (target.tagName === 'WH-CARD' || getCardNode().contains(target))

  if (isInsideCard) {
    clearTimerHideRef()
  } else {
    const range = getRangeAtPoint(e)
    if (range) {
      //console.log(range)
      document.body.style.cursor = 'pointer';
      const word = range.toString().trim().toLowerCase()

      // for quick mark as known, don't show card
      if (!isCardVisible() && silent) {
        toQuickMarkWord = word
        return false
      }

      if (inDirecting) {
        inDirecting = false
        return false
      }

      rangeRect = range.getBoundingClientRect()
      batch(() => {
        setCurWord(word)
        setCurContextText(getWordContext(range))
        setWordContexts(getWordContexts(word))
        setDictHistory([word])
      })
      //adjustCardPosition(rangeRect)

      clearTimerHideRef()
      timerShowRef && clearTimeout(timerShowRef)
      timerShowRef = window.setTimeout(() => {
        //showPopup()
      }, 200)
      autoPauseYTB(true, target)
    } else {
      timerShowRef && clearTimeout(timerShowRef)
      if (isCardVisible()) {

        document.body.style.cursor = previous_cusor;
        hidePopupDelay(settings().mouseHideDelay ?? 500)
        window.setTimeout(() => autoPauseYTB(false), 500)
      }
    }
  }
}

const autoPauseYTB = (pause: boolean, node?: HTMLElement) => {
  if (!location.host.endsWith('youtube.com') || (node && !node.classList.contains('ytd-transcript-segment-renderer')))
    return

  const video = document.querySelector('video')
  if (!video?.paused && pause) {
    video?.pause()
  } else if (video?.paused && !pause) {
    video.play()
  }
}

function onMouseClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  console.log(target)
  console.log(getCardNode().contains(target))
  if (isCardVisible() && !getCardNode().contains(target)) {
    //hidePopupDelay(0)
  }
}

function onAuxclick(e: MouseEvent) {
  if (holdKey === 'z' && toQuickMarkWord) {
    e.preventDefault()
    e.stopImmediatePropagation()
    e.preventDefault()
    markAsKnown(toQuickMarkWord)
    setCurWord('')
    hidePopupDelay(0)
    explode(e.pageX, e.pageY)
    toQuickMarkWord = ''
    return false
  }
}

let waitMouseKeyTask: Function | null

function preMouseMove(e: MouseEvent) {
  waitMouseKeyTask = null
  toQuickMarkWord = ''

  const mouseKey = settings().mouseKey
  if (mouseKey !== 'NONE' && !e[mouseKey]) {
    waitMouseKeyTask = () => {
      onMouseMove(e)
    }
  } else {
    onMouseMove(e, holdKey === 'z')
  }
}

function onKeyDown(e: KeyboardEvent) {
  holdKey = e.key
  if (e[settings().mouseKey]) {
    waitMouseKeyTask && waitMouseKeyTask()
  }
}

function onKeyUp(e: KeyboardEvent) {
  holdKey = null
  if (e[settings().mouseKey]) {
    waitMouseKeyTask = null
  }
}

function onDBClick(event: MouseEvent) {
  console.log(event)
  const word: string | undefined = window.getSelection()?.toString().trimStart().trimEnd()
  if (word && /[a-zA-Z+]/.test(word)) {
    setCurWord(word)
    adjustCardPosition(event.target.getBoundingClientRect())
    clearTimerHideRef()
    timerShowRef && clearTimeout(timerShowRef)
    timerShowRef = window.setTimeout(() => {
      showPopup()
    }, 200)
    //onMouseMove(event)
  }
}

function bindEvents() {
  document.addEventListener('mousemove', preMouseMove)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  // hide popup when click outside card
  document.addEventListener('click', onMouseClick)
  document.addEventListener('auxclick', onAuxclick)
  document.addEventListener('dblclick', onDBClick)
}

function unbindEvents() {
  document.removeEventListener('mousemove', preMouseMove)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
  document.removeEventListener('click', onMouseClick)
  document.removeEventListener('auxclick', onAuxclick)
  document.removeEventListener('dblclick', onDBClick)
}
