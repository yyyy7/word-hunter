import { createSignal, For } from "solid-js"
import { getLocalValue } from "../lib"
import { Messages, StorageKey, WordInfoMap } from "../constant"
import { getMessagePort } from "../lib/port"
import { CollinsDict } from "../content/adapters/collins"


let selectedWords: string[] = []
const dict = new CollinsDict();

const dicts: WordInfoMap =  await getLocalValue(StorageKey.flattenDict);

export const App = () => {
  const [unknownWords, setUnknownWords] = createSignal([])
  const [selecting, setSelecting] = createSignal(false)

  getLocalValue(StorageKey.unknown_words_on_current_page).then(words => {
    setUnknownWords(words)
  })

  chrome.storage.onChanged.addListener(
    (changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
      if (namespace === 'local') {
        if (changes[StorageKey.unknown_words_on_current_page]) {
          console.log('lllllllll')
          console.log(changes[StorageKey.unknown_words_on_current_page].oldValue)
          console.log(changes[StorageKey.unknown_words_on_current_page].newValue)
          setUnknownWords(changes[StorageKey.unknown_words_on_current_page].newValue)
        }
      }
    }
  )

  const onSelect = (e) => {
    const word = e.target.value
    if (e.target.checked) {
      selectedWords.push(word)
    } else {
      const index = selectedWords.indexOf(word)
      if (index > -1) {
        selectedWords.splice(index, 1)
      }
    }
  }

  const onKnown = () => {
    if (selectedWords.length > 0) {
      console.log(selectedWords)
      getMessagePort().postMessage({ action: Messages.set_all_known, words: selectedWords})
      const a = unknownWords().filter(w => !selectedWords.includes(w))
      setUnknownWords(a)
    }
  }

  return (
    <div class="w-full h-full p-2 pr-[3px] bg-[#ECEFF7] dark:bg-[#282828]">
      <div class="bg-white dark:bg-[#3C3C3C] rounded-xl">
        <h1 class="font-extrabold text-xl sm:text-2xl pt-10 text-center text-neutral-content">Unknown Words {unknownWords().length}</h1>
        <div class="container max-w-lg mx-auto p-4 grid gap-10 font-serif">
          <div class="flex flex-row gap-2 sticky top-1 left-0 right-0">
            <button class="bg-slate-200 basis-1/2 rounded-md" onClick={() => setSelecting(!selecting())}>{selecting() ? "cancel": "select"}</button>
            {selecting() && <button class="bg-slate-300 basis-1/2 rounded-md" onClick={() => onKnown()}>known</button>}
          </div>
          <For each={unknownWords()} fallback={<div>No items</div>}>
            {(word, index) => 
            <div data-index={index()} class="flex flex-row gap-2 border-b border-indigo-500/50 p-2 text-base">
              {selecting() && <input type="checkbox" class="checkbox checkbox-xs" id={index().toString()} value={word} onChange={(e) => onSelect(e)} /> }
              <span>{word} : {dicts[word].t}</span>
            </div>}
          </For>
        </div>
      </div>
    </div>
  )
}