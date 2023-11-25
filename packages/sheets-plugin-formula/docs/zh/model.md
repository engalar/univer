# 公式的模型层设计

公式字符串并不像其他的功能一样作为插件 model 单独存储，而是直接存储在 `ICellData` 的 `f` 字段中，并且在 `setRangeValues` mutation 中对公式内容进行处理。

把公式完全从内核中抽离出来可能是不适当的，例如不好处理并发编辑时，写入公式和写入普通 value 冲突的问题。