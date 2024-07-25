import { createSignal, For } from "solid-js"
import { getLocalValue } from "../lib"
import { StorageKey } from "../constant"



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
          setUnknownWords(changes[StorageKey.unknown_words_on_current_page].newValue)
        }
      }
    }
  )

  return (
    <div class="w-full h-full p-2 pr-[3px] bg-[#ECEFF7] dark:bg-[#282828]">
      <div class="bg-white dark:bg-[#3C3C3C] rounded-xl">
        <h1 class="font-extrabold text-xl sm:text-2xl pt-10 text-center text-neutral-content">Unknown Words {unknownWords().length}</h1>
        <div class="container max-w-lg mx-auto p-4 grid gap-10 font-serif"></div>
        <button class="bg-slate-200" onClick={() => setSelecting(!selecting())}>{selecting() ? "cancel": "select"}</button>
        <For each={unknownWords()} fallback={<div>No items</div>}>
          {(item, index) => 
          <div data-index={index()}>
            {selecting() && <input type="checkbox" id={index().toString()} /> }
            <span>{item}</span>
          </div>}
        </For>
      </div>
    </div>
  )
}