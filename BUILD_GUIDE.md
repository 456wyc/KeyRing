# Key Ring 打包指南

## 准备工作

### 1. 创建图标文件

在 `build` 目录下需要放置应用图标：

- **Windows**: `icon.ico` (256x256 像素，.ico 格式)
- **macOS**: `icon.icns` (512x512 像素，.icns 格式)  
- **Linux**: `icon.png` (512x512 像素，.png 格式)

### 2. 图标制作工具

可以使用在线工具或以下软件制作图标：
- 在线转换：https://www.icoconverter.com/
- 设计工具：Figma, Photoshop, GIMP

## 打包命令

### Windows 安装包
```bash
# 生成 NSIS 安装程序和便携版
npm run package:win
```

### macOS 安装包
```bash
# 生成 DMG 安装镜像
npm run package:mac
```

### Linux 安装包
```bash
# 生成 AppImage 和 DEB 包
npm run package:linux
```

### 全平台打包
```bash
# 生成所有平台的安装包
npm run package
```

## 输出文件

打包完成后，安装包将出现在 `packages` 目录下：

### Windows
- `Key Ring Setup 1.0.0.exe` - NSIS 安装程序
- `Key Ring 1.0.0.exe` - 便携版程序

### macOS
- `Key Ring-1.0.0.dmg` - DMG 安装镜像

### Linux
- `Key Ring-1.0.0.AppImage` - AppImage 格式
- `key-ring_1.0.0_amd64.deb` - DEB 安装包

## 安装包特性

### Windows NSIS 安装程序
- 支持自定义安装路径
- 创建桌面快捷方式
- 创建开始菜单快捷方式
- 支持卸载程序

### Windows 便携版
- 无需安装，解压即用
- 适合 U 盘携带使用

### macOS DMG
- 标准 macOS 安装方式
- 支持 Intel 和 Apple Silicon

### Linux AppImage
- 无需安装，直接运行
- 兼容大部分 Linux 发行版

### Linux DEB
- 标准 Debian/Ubuntu 安装包
- 支持系统包管理器

## 注意事项

1. **首次打包**：需要下载平台相关的构建工具，可能需要较长时间
2. **跨平台打包**：在 Windows 上无法构建 macOS 包，需要对应平台
3. **代码签名**：生产环境建议添加代码签名以避免安全警告
4. **图标文件**：确保图标文件存在且格式正确，否则会使用默认图标

## 故障排除

### 常见问题

1. **找不到图标文件**：确保图标放在 `build` 目录下
2. **构建失败**：检查 Node.js 版本，建议使用 LTS 版本
3. **权限问题**：Windows 上可能需要以管理员身份运行
4. **网络问题**：首次构建需要下载依赖，确保网络连接正常

### 临时解决方案

如果没有图标文件，可以先移除图标配置：
1. 打开 `package.json`
2. 删除 `"icon"` 相关行
3. 重新运行打包命令