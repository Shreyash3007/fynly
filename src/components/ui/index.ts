/**
 * UI Components Index
 * Export all reusable UI components
 */

export { Button } from './Button'
export type { ButtonProps } from './Button'

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
  FormSkeleton 
} from './Loading'
export type { LoadingProps } from './Loading'

export { EmptyState, EmptyStates } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export { LoadingSpinner, SkeletonLoader, PageLoader } from './LoadingSpinner'
export type { LoadingSpinnerProps } from './LoadingSpinner'

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

export { 
  AccessibilityEnhancer, 
  useKeyboardNavigation, 
  useFocusManagement, 
  useScreenReader, 
  ScreenReaderAnnouncements, 
  FocusIndicator 
} from './AccessibilityEnhancer'

// Mobile Components
export {
  MobileHeader,
  MobileSidebar,
  MobileCard,
  MobileSearch,
  MobileBottomNav,
  useMobile
} from '../mobile/MobileOptimizedLayout'

// Performance Components
export {
  OptimizedImage,
  OptimizedAvatar,
  ResponsiveImageGallery
} from '../performance/ImageOptimizer'

export {
  LazyLoadWrapper,
  LazyImage,
  LazyList,
  VirtualList,
  createLazyComponent,
  useIntersectionObserver,
  useVirtualScrolling
} from '../performance/LazyLoader'

// Search Components
export {
  AdvancedSearch,
  SearchResults
} from '../search/AdvancedSearch'

// Validation Components
export {
  ValidatedInput,
  ValidationSummary,
  useValidation,
  useRealTimeValidation,
  validationRules
} from '../validation/FormValidation'

// Upload Components
export {
  FileUpload,
  ImageUpload,
  DocumentUpload
} from '../upload/FileUpload'



