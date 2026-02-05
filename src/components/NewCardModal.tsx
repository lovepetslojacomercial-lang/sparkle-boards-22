 import { useState, useEffect, useRef } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { KanbanColumn } from '@/types/kanban';
 import { useKanbanStore } from '@/store/kanbanStore';
 
 interface NewCardModalProps {
   open: boolean;
   onClose: () => void;
   columns: KanbanColumn[];
 }
 
 export function NewCardModal({ open, onClose, columns }: NewCardModalProps) {
   const { addCard } = useKanbanStore();
   const [title, setTitle] = useState('');
   const [selectedColumnId, setSelectedColumnId] = useState('');
   const inputRef = useRef<HTMLInputElement>(null);
 
   // Pre-select first column when modal opens
   useEffect(() => {
     if (open && columns.length > 0) {
       setSelectedColumnId(columns[0].id);
       setTitle('');
       // Focus input after modal animation
       setTimeout(() => {
         inputRef.current?.focus();
       }, 100);
     }
   }, [open, columns]);
 
   const handleSave = () => {
     if (title.trim() && selectedColumnId) {
       addCard(selectedColumnId, title.trim());
       setTitle('');
       onClose();
     }
   };
 
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' && title.trim() && selectedColumnId) {
       e.preventDefault();
       handleSave();
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
       <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle>Novo Card</DialogTitle>
         </DialogHeader>
 
         <div className="space-y-4 py-4">
           <div className="space-y-2">
             <Label htmlFor="card-title">Título da Tarefa</Label>
             <Input
               ref={inputRef}
               id="card-title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Digite o título do card..."
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="column-select">Selecione a Coluna</Label>
             <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
               <SelectTrigger id="column-select">
                 <SelectValue placeholder="Escolha uma coluna" />
               </SelectTrigger>
               <SelectContent className="bg-popover z-50">
                 {columns.map((column) => (
                   <SelectItem key={column.id} value={column.id}>
                     {column.title}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
         </div>
 
         <DialogFooter>
           <Button variant="outline" onClick={onClose}>
             Cancelar
           </Button>
           <Button
             onClick={handleSave}
             disabled={!title.trim() || !selectedColumnId}
           >
             Salvar
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }