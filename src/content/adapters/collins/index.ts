import dictStyles from './index.css?inline'
import type { Adapter, DictResult } from '../type'
import { fetchText } from '../fetch'

const cache: Record<string, string> = {}

export class CollinsDict implements Adapter {
  readonly name = 'collins'
  readonly host = 'https://www.collinsdictionary.com'
  readonly apiBase = `${this.host}/dictionary/english/`
  readonly sectionSelector = '.cB'

  get style() {
    return dictStyles
  }

  async lookup({ word }: { word: string; text?: string }) {
    if (cache[word]) return Promise.resolve(cache[word])
    try {
      const doc = await this.fetchDocument(word)
      const data = this.parseDocument(doc, word)
      cache[word] = data
      return data
    } catch (e) {
      console.warn(e)
      return ''
    }
  }

  async lookupD({ word }: { word: string; text?: string }) {
    if (cache[word]) return Promise.resolve(cache[word])
    try {
      const doc = await this.fetchDocument(word)
      const data = this.parse(doc)
      console.log(data)
      return data
    } catch (e) {
      console.warn(e)
      return null
    }
  }

  private async fetchDocument(word: string) {
    const url = this.getPageUrl(word)
    const html = await fetchText(url)
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc
  }

  getPageUrl(word: string) {
    return `${this.apiBase}${encodeURIComponent(word.replace(/\s+/g, '-'))}`
  }

  parse(doc: Document): DictResult {
    const result: DictResult = {
      word: '',
      phonetics: [],
      meanings: [],
      wordForms: {
        plural: undefined,
        past: undefined,
        pastParticiple: undefined,
        present: undefined,
        comparative: undefined,
        superlative: undefined
      }
    }

    // 提取单词
    const wordEl = doc.querySelector('.h2_entry')
    result.word = wordEl?.textContent?.trim() ?? ''

    // 提取音标
    const el = doc.querySelector('.pron.type-ipa')
    if (el) {
      const text = el.textContent?.trim()
      const audio = el.querySelector('.audio_play_button')?.getAttribute('data-src-mp3') ?? undefined
      if (text) {
        result.phonetics.push({ text, audio })
      }
    }
    

    // 提取释义
    doc.querySelectorAll('.hom').forEach(block => {
      const partOfSpeech = block.querySelector('.pos')?.textContent?.trim() ?? ''
      const definitions: DictResult['meanings'][0]['definitions'] = []

      block.querySelectorAll('.sense').forEach(sense => {
        const def = sense.querySelector('.def')?.textContent?.trim()
        const example = sense.querySelector('.cit.type-example')?.textContent?.trim()
        
        if (def) {
          definitions.push({
            definition: def,
            example: example
          })
        }
      })

      if (definitions.length > 0) {
        result.meanings.push({
          partOfSpeech,
          definitions
        })
      }
    })

    // Collins 词典中提取单词变形
  const forms = doc.getElementsByClassName("form inflected_forms type-infl")[0]
  console.log(forms)
  if (forms) {
    const types = forms.querySelectorAll('.type-gram')
    const values = forms.querySelectorAll('.orth')

    for (let i = 0; i < types.length; i++) {
      const type = types[i].textContent?.trim().toLowerCase()
      const value = values[i]?.textContent?.trim()

      console.log(type)
      console.log(value)
      if (type && value) {
        switch(true) {
          case type.includes('plural') || type === 'pl':
            result.wordForms.plural = value
            break
          case type.includes('past tense') || type === 'pt':
            result.wordForms.past = value
            break
          case type.includes('past participle') || type === 'pp':
            result.wordForms.pastParticiple = value
            break
          case type.includes('present participle'):
            result.wordForms.present = value
            break
          case type.includes('comparative'):
            result.wordForms.comparative = value
            break
          case type.includes('superlative'):
            result.wordForms.superlative = value
            break
          case type.includes('3rd person singular present tense'):
            result.wordForms.thrid = value
            break
          default:
            result.wordForms[type] = value
        }
      }
    }
  }

    return result
  }
  

  private parseDocument(doc: Document, word: string) {
    const root = doc.querySelector('#main_content .res_cell_center')
    if (!root) return ''

    const toRemoveSelectors = [
      '.navigation',
      'h1.entry_title',
      '.share-button',
      '.share-overlay',
      '.popup-overlay',
      'input',
      'label',
      'script',
      'style',
      'noscript',
      'iframe',
      '.cobuild-logo',
      '.socialButtons',
      '.mpuslot_b-container',
      '.copyright',
      '.cB-hook',
      '.beta',
      '.link_logo_information',
      '[data-type-block="Word usage trends"]',
      '[data-type-block="Word lists"]',
      '.type-thesaurus',
      '.extra-link',
      '.carousel-title',
      '.btmslot_a-container',
      '.pronIPASymbol',
      '.ex-info',
      '.pB-quiz',
      '.specialQuiz',
      '.new-from-collins',
      '.homnum',
      '.suggest_new_word_wrapper',
      '.miniWordle',
      '#videos',
      '.dictionary ~ .dictionary',
      '.dictionary ~ .assets',
      '.cB-n-w',
      '.cB-o'
    ]

    toRemoveSelectors.forEach(selector => {
      root.querySelectorAll(selector).forEach(el => el.remove())
    })

    root.querySelectorAll('img.lazy').forEach(el => {
      const src = el.getAttribute('data-src')
      if (src) {
        el.setAttribute('src', src)
        el.setAttribute('loading', 'lazy')
      }
    })

    const html = root.innerHTML

    return html
      .replace(/<(script|style|noscript)[^>]*>.*?<\/\1>/g, '')
      .replaceAll(`href="${this.apiBase}`, `data-href="${this.apiBase}`)
      .replaceAll('<a href="">', '<a href="#">')
      .replaceAll('<a ', '<a target="_blank" ')
      .replaceAll('src="/', `src="${this.host}/`)
      .replaceAll('href="/', `href="${this.host}/`)
  }

  getWordByHref(href: string) {
    const url = new URL(href)
    const path = url.pathname
    const word = path.replace('/dictionary/english/', '')
    return word.toLowerCase()
  }

  cspViolationHandler(e: SecurityPolicyViolationEvent, root: HTMLElement) {
    const sectionSelector = '[data-type-block]'
    if (e.violatedDirective === 'img-src') {
      if (e.blockedURI.startsWith(this.host)) {
        root.querySelector(`img[src^="${e.blockedURI}"]`)?.closest(sectionSelector)?.remove()
      }
    }
  }
}
