import en from '@/utils/i18n/en.json'
import fr from '@/utils/i18n/fr.json'
import zhCN from '@/utils/i18n/zh_CN.json'
import ko from '@/utils/i18n/ko.json'
import ru from '@/utils/i18n/ru.json'
import es from '@/utils/i18n/es.json'
import zhTW from '@/utils/i18n/zh_TW.json'
import { useAppStore } from '@/store/app'

const trans = {
  'en': en,
  'fr': fr,
  'zh-CN': zhCN,
  'ko': ko,
  'ru': ru,
  'es': es,
  'zh-TW': zhTW,
}
export function T (key, params, num = 0) {
  const appStore = useAppStore()
  const raw = appStore.setting.lang
  const lang = trans[raw] ? raw : (trans[String(raw || '').split('-')[0]] ? String(raw).split('-')[0] : 'es')
  const tran = trans[lang]?.[key]
  if (!tran) {
    return key
  }
  const msg = num > 1 ? (tran.Other ? tran.Other : tran.One) : tran.One
  //msg 是这样 {name} is name
  //params 是这样 {name: 'zhangsan'}
  //替换
  return msg.replace(/{(\w+)}/g, function (match, key) {
    return params[key] || match
  })
}
