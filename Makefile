# 签名生成工具 - 常用命令速查
# 用法: make [target]，不带参数时显示帮助

.DEFAULT_GOAL := help

.PHONY: help install dev build start lint

help: ## 显示可用命令
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## 安装依赖
	npm install

dev: ## 启动开发服务器 (http://localhost:3000)
	npm run dev

build: ## 生产构建
	npm run build

start: ## 启动生产服务器
	npm run start

lint: ## 代码检查
	npm run lint
