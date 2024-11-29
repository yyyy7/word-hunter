import { createEffect, createSignal, For, onMount } from "solid-js"
import { Messages, StorageKey, WordInfoMap, wordRegex } from "../constant"
import { getLocalValue, setLocalValue } from "../lib"
import { getOriginForm } from "../content/highlight";
import { getMessagePort } from "../lib/port";

const dicts: WordInfoMap = await getLocalValue(StorageKey.flattenDict);

export const WordsSection = () => {
  const [active, setActive] = createSignal(true)

  const [unknownWords, setUnknownWords] = createSignal([])
  const [selecting, setSelecting] = createSignal(false)
  const [tabId, setTabId] = createSignal(0)

  getLocalValue(StorageKey.unknown_words_on_current_page).then(words => {
    console.log(words)
    setUnknownWords(words)
  })

  async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  onMount(() => {
    getCurrentTab().then(tab => setTabId(tab.id ?? 0))
  })

  createEffect(() => {
    const currentTabId = tabId()
    console.log('-------- tabId:', currentTabId)

    getLocalValue(StorageKey.tab_words).then(v => {
      setUnknownWords(v[currentTabId])
    })
  })

  const knowWord = (word: string) => {
    setUnknownWords(unknownWords().filter(ele => ele != word))
  }


  chrome.runtime.onConnect.addListener(async port => {
    if (port.name === 'word-hunter') {
      port.onMessage.addListener((msg, sendingPort) => {
        const senderId = sendingPort?.sender?.tab?.id
        console.log("sent from tab.id=", senderId);
        switch (msg.action) {
          case Messages.current_page_words:
            getCurrentTab().then(tab => {
              console.log(tab)
              if (tab?.id == senderId) {
                setUnknownWords(msg.words)
                
              }
            })
            break

          case Messages.set_known:
            knowWord(msg.word)
        }
      });
    }
  }
  )

  chrome.tabs.onActivated.addListener(
    (activeInfo) => {
      console.log(activeInfo)
      setTabId(activeInfo.tabId)
      console.log(tabId())
    }
  )

  const markAsKnown = (word: string) => {
    console.log(word)
    if (!wordRegex.test(word)) return
  
    knowWord(word)
    const originFormWord = getOriginForm(word)
    //wordsKnown[originFormWord] = 'o'
    getMessagePort().postMessage({ action: Messages.set_known, word: originFormWord })
  }

  return (
    <div class="pt-2 text-sm ">
      <div class="titles flex justify-start gap-x-2">
        <div class={` pb-1 border-b-2 ${active() ? 'border-orange-500' : ''}`}>
          本页生词({unknownWords().length})
        </div>

        <div class={` pb-1 border-b-2 ${!active() ? 'border-orange-500' : ''}`}>
          已掌握(0)
        </div>
      </div>

      <div class="overflow-auto max-h-[60vh]">

        <For each={unknownWords()} fallback={<div>No items</div>}>
          {(word, index) =>
            <div data-index={index()} class="flex flex-row gap-2 justify-between border-b border-indigo-500/50 p-2 text-base">
              <span class="text-xs">{word} : {dicts[word]?.t}</span>
              <div class="actions flex gap-1">
                <Btn text="添加生词" svg={likeIcon()} action={() => {}} />
                <Btn text="掌握" svg={knowIcon()} action={() => markAsKnown(word)}/>
                <Btn text="详情" svg={detailsIcon()} action={() => {}}/>
                </div>
            </div>}
        </For>

      </div>
    </div>
  )
}


const likeIcon = () => {
  return (
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="remixicon "><path d="M19.0001 14V17H22.0001V19H18.9991L19.0001 22H17.0001L16.9991 19H14.0001V17H17.0001V14H19.0001ZM20.2426 4.75748C22.505 7.02453 22.5829 10.6361 20.4795 12.9921L19.06 11.5741C20.3901 10.05 20.3201 7.66 18.827 6.17022C17.3244 4.67104 14.9076 4.60713 13.337 6.017L12.0019 7.21536L10.6661 6.01793C9.09098 4.60609 6.67506 4.66821 5.17157 6.1717C3.68183 7.66143 3.60704 10.0474 4.97993 11.6233L13.412 20.0691L11.9999 21.4851L3.52138 12.9931C1.41705 10.6371 1.49571 7.01913 3.75736 4.75748C6.02157 2.49327 9.64519 2.41699 12.001 4.52865C14.35 2.42012 17.98 2.49012 20.2426 4.75748Z"></path></svg>
      
  )
}

const knowIcon = () => {
  return (
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="remixicon "><path d="M11.602 13.7599L13.014 15.1719L21.4795 6.7063L22.8938 8.12051L13.014 18.0003L6.65 11.6363L8.06421 10.2221L10.189 12.3469L11.6025 13.7594L11.602 13.7599ZM11.6037 10.9322L16.5563 5.97949L17.9666 7.38977L13.014 12.3424L11.6037 10.9322ZM8.77698 16.5873L7.36396 18.0003L1 11.6363L2.41421 10.2221L3.82723 11.6352L3.82604 11.6363L8.77698 16.5873Z"></path></svg>

  )
}

const detailsIcon = () => {
  return (<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="remixicon "><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg>)
}

const Btn = ({text, svg, action}) => {
  return (
    <div class="relative inline-block group hover:cursor-pointer" onclick={(e) => action()}>
                  {svg}
                  <div class="absolute bottom-full pointer-events-none left-1/2 transform -translate-x-1/2 mb-2 w-max px-3 py-1 text-sm text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {text}
                  </div>
                </div>

  )
}

