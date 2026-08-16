// 旅行計画に関するTanStack QueryのQuery Key。frontend/mobileで同じキーを使うことで
// invalidateQueries等の対象がずれないようにする。
export const tripQueryKeys = {
  all: ['trips'] as const,

  list: () => [...tripQueryKeys.all, 'list'] as const,

  detail: (id: number) => [...tripQueryKeys.all, 'detail', id] as const,
}
