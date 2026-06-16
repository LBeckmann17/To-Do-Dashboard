import {
  Briefcase, User, Sparkles, ShoppingCart, LayoutDashboard, Calendar,
  MessageSquare, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Sun, Moon, Search, Bell, Plus, Trash2, Edit3, Check, X, Settings,
  Loader2, MoreHorizontal, Tag, AlertCircle, Clock, BarChart2, Bot,
  Mic, Send, Zap, List, Grid, ArrowRight, Hash, Circle,
} from 'lucide-react'

const MAP = {
  Briefcase, User, Sparkles, ShoppingCart, LayoutDashboard, Calendar,
  MessageSquare, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Sun, Moon, Search, Bell, Plus, Trash2, Edit3, Check, X, Settings,
  Loader2, MoreHorizontal, Tag, AlertCircle, Clock, BarChart2, Bot,
  Mic, Send, Zap, List, Grid, ArrowRight, Hash, Circle,
}

export default function Icon({ name, size = 16, ...props }) {
  const C = MAP[name]
  if (!C) return null
  return <C size={size} strokeWidth={1.8} {...props} />
}
