import { AllItems, ApiItem, Category } from '../hooks/useApi'

export type Action =
  | { type: 'SET_ITEMS'; allItems: AllItems }
  | { type: 'CREATE'; category: Category; title: string; id: string }
  | { type: 'UPDATE'; item: Item; category: Category }
  | {
      type: 'UPDATE_CATEGORY'
      newCategory: Category
      oldCategory: Category
      position: number
      id: string
    }
  | {
      type: 'UPDATE_DRAG_OVER'
      id: string
      category: Category
      isDragOver: boolean
    }
  | {
      type: 'UPDATE_HOVER'
      id: string
      category: Category
      isHover: boolean
    }
  | { type: 'SET_EDIT'; edit: EditItem }
  | { type: 'RESTORE_ITEM'; item: ApiItem }
  | { type: 'DELETE'; id: string; category: Category }

export type Item = {
  id: string
  title: string
  content: string
  isDragOver: boolean
  isHover: boolean
}

type EditItem = {
  item: Item
  category: Category
  position: number
} | null

type CategoryState = {
  [key in Category]: Item[]
}

export interface Kanban extends CategoryState {
  edit: EditItem
}
