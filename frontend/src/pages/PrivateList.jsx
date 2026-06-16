import TaskListPage from './TaskListPage'
import { LISTS } from '../utils/constants'
export default function PrivateList() { return <TaskListPage list={LISTS.find(l => l.key === 'priv')} /> }
