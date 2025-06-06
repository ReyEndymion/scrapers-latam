import got from 'got'
import { load } from 'cheerio'
import FormData from 'form-data'
import { TextProList, TextProSchema } from '../types/index.js'

type TextProPostJSON = {
  success: boolean,
  info: string,
  code: number,
  image: string,
  fullsize_image: string,
  image_code: string,
  session_id: number
}

const BASE_URL = 'https://textpro.me'

export const textproList: Promise<TextProList[]> = (async () => got('https://raw.githubusercontent.com/reyendymion/scraper/master/data/textpro.json').json<TextProList[]>())()
export default async function textpro (effect: string, params: string[] | string) {
  const list: TextProList[] = await textproList
  const textpro: TextProList | undefined = list.find(
    ({ title }) => title.toLowerCase() === effect.toLowerCase()
  )
  if (!textpro) throw new Error(`TextPro "${effect}" not found`)
  if (!Array.isArray(params)) params = [params]
  const { link, parameters } = textpro
  if (parameters.length > params.length) throw new Error(`TextPro "${effect}" requires ${parameters.length} parameters, but ${params.length} given`)
  const resToken = await got(`${BASE_URL}${link}`)
  const cookie = resToken.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ').trim()
  const HEADERS = {
    cookie: cookie || '__gads=ID=63da40a14f3eb127-22dccf741fd10073:T=1648080134:RT=1648080134:S=ALNI_MZfEIreNTkduqqV5CgZnuei_X1xLQ; _ga=GA1.2.342524260.1648080135; _gid=GA1.2.2036288127.1648080139; PHPSESSID=7fmr2ig9k8r7n9g9uk7fcj2ru1; _gat_gtag_UA_114571019_5=1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36'
  }
  const $ = load(resToken.body)
  const token = $('#token').val() as string
  const build_server = $('#build_server').val() as string
  const build_server_id = $('#build_server_id').val() as string
  const form = new FormData()
  for (const param of params) form.append('text[]', param)
  form.append('submit', 'Go')
  form.append('token', token)
  form.append('build_server', build_server)
  form.append('build_server_id', build_server_id)
  const html = await got(`${BASE_URL}${link}`, {
    method: 'POST',
    headers: {
      ...HEADERS,
      ...form.getHeaders()
    },
    body: form.getBuffer()
  }).text()
  const $$ = load(html)
  const form2 = $$('#form_value').eq(0).text()
  if (!form2) throw new Error(`TextPro "${effect}" failed. \n ${html}`)
  const json = await got.post(`${BASE_URL}/effect/create-image`, {
    headers: HEADERS,
    form: JSON.parse(form2)
  }).json<TextProPostJSON>()
  return TextProSchema.parse(`${BASE_URL}${json.image || json.fullsize_image}`)
}
