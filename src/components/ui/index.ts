/**
 * UI Components Index
 * Export all reusable UI components
 */

export { Button } from './Button'
export type { ButtonProps } from './Button'

export { Progress, CircularProgress } from './Progress'

export { Card, CardHeader, CardTitle, CardContent } from './Card'
export type { CardProps } from './Card'

export { Badge } from './Badge'
export type { BadgeProps } from './Badge'

export { Input } from './Input'
export type { InputProps } from './Input'

export { Select } from './Select'
export type { SelectProps } from './Select'

export { Textarea } from './Textarea'
export type { TextareaProps } from './Textarea'

export { Modal, BookingModal, PaymentModal } from './Modal'
export type { ModalProps } from './Modal'


export { StatsCard } from './Card'
export { VerifiedBadge } from './Badge'

export { 
  Loading, 
  LoadingSkeleton, 
  PageLoader, 
  CardSkeleton, 
  AdvisorCardSkeleton, 
  DashboardSkeleton, 
  TableSkeleton, 
  ListSkeleton, 
  FormSkeleton,
  DashboardHeroSkeleton,
  StatsCardSkeleton,
  BookingCardSkeleton,
  InsightsSkeleton,
  AdvisorGridSkeleton,
  BookingFlowSkeleton
} from './Loading'
export type { LoadingProps } from './Loading'

export { EmptyState, EmptyStates } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export { LoadingSpinner, SkeletonLoader, FullPageLoader } from './LoadingSpinner'

export { 
  ErrorMessage, 
  NetworkError, 
  NotFoundError, 
  PaymentError, 
  AuthError 
} from './ErrorMessage'

export { 
  ToastComponent, 
  ToastContainer, 
  useToast 
} from './Toast'
export type { Toast } from './Toast'

// NotificationBell removed - using email-only notifications for MVP

export { 
  AccessibilityEnhancer, 
  useKeyboardNavigation, 
  useFocusManagement, 
  useScreenReader, 
  ScreenReaderAnnouncements, 
  FocusIndicator 
} from './AccessibilityEnhancer'

// Mobile Components removed - using Tailwind responsive classes for MVP

// Performance Components removed - using Next.js built-in Image and lazy loading for MVP

// Search Components removed - using basic search filters for MVP

// Validation Components
export {
  ValidatedInput,
  ValidationSummary,
  useValidation,
  useRealTimeValidation,
  validationRules
} from '../validation/FormValidation'

// Upload Components
export { FileUpload } from '../upload/FileUpload'



