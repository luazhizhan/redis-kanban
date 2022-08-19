import * as JD from 'decoders'

export const ItemDecoder = JD.object({
  id: JD.string,
  title: JD.string,
  content: JD.string,
  isDragOver: JD.boolean,
  category: JD.oneOf(['todo', 'doing', 'done']),
})
