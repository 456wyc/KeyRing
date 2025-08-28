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

  tags: {
    tags: '标签',
    addTags: '添加标签...',
    createTag: '创建标签',
    noTags: '无标签',
    filterByTag: '按标签筛选',
    showTags: '显示标签',
    hideTags: '隐藏标签'
  },

  backup: {
    title: '备份与恢复',
    backupRestore: '备份与恢复',
    export: '导出数据',
    import: '导入数据',
    exportNow: '导出备份',
    importNow: '导入备份',
    secureExport: '安全数据导出',
    exportDescription: '创建所有账户数据的安全备份。此文件可用于在其他设备上恢复数据或重新安装应用程序后恢复数据。',
    importWarning: '导入警告',
    importDescription: '导入数据将向您现有的收藏中添加新账户。如果多次导入相同数据，可能会创建重复账户。',
    currentData: '当前数据摘要',
    totalAccounts: '账户总数',
    lastModified: '最后修改',
    never: '从未',
    noDataToExport: '无数据可导出',
    selectFile: '选择备份文件以导入您的数据',
    chooseFile: '选择文件',
    importing: '正在导入数据...',
    exportFailed: '导出数据失败',
    importFailed: '导入数据失败',
    importSuccess: '数据导入成功',
    importSuccessTitle: '导入成功',
    importErrorTitle: '导入失败',
    invalidFormat: '无效的备份文件格式',
    invalidAccountData: '备份文件中的账户数据无效',
    importConfirm: '这将向您的收藏中导入 {count} 个账户。您当前有 {current} 个账户。继续吗？',
    accountsImported: '成功导入 {count} 个账户'
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