import TaskListPage from './TaskListPage'
import { LISTS } from '../utils/constants'
export default function WorkList() { return <TaskListPage list={LISTS.find(l => l.key === 'work')} /> }
