import TaskListPage from './TaskListPage'
import { LISTS } from '../utils/constants'
export default function CleaningPlan() { return <TaskListPage list={LISTS.find(l => l.key === 'clean')} /> }
