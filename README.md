# UWB Positioning System

超宽带定位系统

## 模块设计目标

  - 开启socket不断接收UDP报文.
  - 根据报文内容更新Anchor的个数和位置.
  - Anchor定位完毕后, 根据报文内容更新Tag的个数和位置.

## 算法简述

### Anchor定位过程

  - 根据接收到的该Anchor的报文, 获得该Anchor到其他Anchor的距离.
  - 当距离收集到一定规模时, 服务器手动启动（也可后期根据条件判断自动启动）Anchor定位流程.
  - 顺序多次遍历每个Anchor, 依次确定他们的坐标.
  - 如果有某一Anchor坐标无法确定, 则Anchor定位失败, 无法进入下一步Tag定位过程. 等待重启下一次Anchor定位流程.
