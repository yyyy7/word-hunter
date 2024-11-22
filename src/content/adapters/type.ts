export interface Adapter {
  readonly name: string
  readonly host: string
  readonly apiBase: string
  readonly sectionSelector: string

  get style(): string
  lookup(context: { word: string; text?: string }): Promise<string>
  getPageUrl: (word: string) => string
  getWordByHref(href: string): string
  cspViolationHandler?: (e: SecurityPolicyViolationEvent, root: HTMLElement) => void
  bindRootClickEvent?: (root: HTMLElement) => void
  unbindRootClickEvent?: () => void
}

export interface DictResult {
  word: string
  phonetics: Array<{
    text?: string
    audio?: string
  }>
  meanings: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example?: string
      synonyms?: string[]
      antonyms?: string[]
    }>
  }>
  wordForms: {
    plural?: string      // 复数形式
    past?: string       // 过去式
    pastParticiple?: string  // 过去分词
    present?: string    // 现在分词
    comparative?: string // 比较级
    superlative?: string // 最高级
    thrid?: string // 第三人称
    [key: string]: string | undefined  // 其他可能的变形
  }
}