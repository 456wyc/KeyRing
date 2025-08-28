import { I18nMessages } from './types'

export const zhMessages: I18nMessages = {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    add: '添加',
    search: '搜索',
    copy: '复制',
    show: '显示',
    hide: '隐藏',
    confirm: '确认',
    loading: '加载中...'
  },

  app: {
    title: '密钥环',
    lock: '锁定',
    unlock: '解锁'
  },

  login: {
    title: '密钥环',
    subtitle: '安全密码管理器',
    masterPassword: '主密码',
    unlock: '解锁',
    initialize: '初始化',
    createMasterPassword: '创建主密码',
    confirmPassword: '确认密码',
    passwordMismatch: '密码不匹配',
    invalidPassword: '主密码错误',
    setupComplete: '设置完成！现在可以添加您的账户了。',
    importantWarning: '重要提示：请牢记您的主密码。密码丢失后无法恢复。'
  },

  accountManager: {
    title: '密钥环',
    searchPlaceholder: '搜索账户...',
    addAccount: '添加账户',
    addFirstAccount: '添加您的第一个账户',
    noAccounts: '暂无账户。',
    noSearchResults: '未找到匹配的账户。',
    cardView: '卡片视图',
    listView: '列表视图'
  },

  account: {
    name: '账户名称',
    fields: '字段',
    visible: '可见',
    lastUpdated: '最后更新',
    created: '创建时间',
    updated: '更新时间',
    addField: '添加字段',
    removeField: '删除字段',
    fieldName: '字段名称',
    fieldValue: '字段值',
    fieldExists: '字段名称已存在！',
    deleteConfirm: '您确定要删除'
  },

  accountDetail: {
    title: '账户详情',
    editAccount: '编辑账户',
    copyToClipboard: '复制到剪贴板'
  },

  addAccountModal: {
    title: '添加新账户',
    accountName: '账户名称',
    accountNamePlaceholder: '例如：Gmail、GitHub、银行账户',
    accountFields: '账户字段',
    adding: '添加中...',
    addAccount: '添加账户'
  },

  passwordGenerator: {
    title: '密码生成器',
    generate: '生成',
    copy: '复制',
    length: '长度',
    includeUppercase: '包含大写字母',
    includeLowercase: '包含小写字母',
    includeNumbers: '包含数字',
    includeSymbols: '包含符号',
    excludeAmbiguous: '排除易混淆字符',
    customCharacters: '自定义字符',
    excludeCharacters: '排除字符',
    usePassword: '使用此密码',
    generatedPassword: '生成的密码'
  },

  fieldList: {
    hiddenByDefault: '字段默认隐藏',
    visibleByDefault: '字段默认可见',
    generatePassword: '生成密码',
    removeField: '删除字段'
  },

  messages: {
    failedToAdd: '添加账户失败',
    failedToUpdate: '更新账户失败',
    failedToDelete: '删除账户失败',
    copiedToClipboard: '已复制到剪贴板',
    initializationFailed: '存储初始化失败',
    unlockFailed: '存储解锁失败'
  }
}