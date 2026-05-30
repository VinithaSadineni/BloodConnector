import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = 'md',
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay with backdrop blur */}
        <Dialog.Overlay className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 transition-opacity animate-fade-in" />
        
        {/* Modal Scaffolding Container */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-h-[85vh] focus:outline-none animate-slide-up">
          <Card className={cn('w-full border-white/10 shadow-blood-lg overflow-y-auto flex flex-col', sizes[size], className)}>
            <CardHeader className="relative pr-10 border-b border-border/80">
              {title && <CardTitle className="text-xl">{title}</CardTitle>}
              {description && (
                <Dialog.Description className="text-xs text-text-muted/80 mt-1 font-body">
                  {description}
                </Dialog.Description>
              )}
              <Dialog.Close asChild>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 border border-border text-text-muted hover:text-text-primary transition-all duration-200 outline-none active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </CardHeader>
            
            <CardContent className="py-5 flex-1 font-body text-sm text-text-primary">
              {children}
            </CardContent>
            
            {footer && (
              <CardFooter className="py-3.5 border-t border-border/80 flex items-center justify-end gap-3 bg-surface-2/20">
                {footer}
              </CardFooter>
            )}
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
