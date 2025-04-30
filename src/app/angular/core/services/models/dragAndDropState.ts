export type DragAndDropState = {
    dragging: boolean;
    file: File | null;
}

export type DragAndDropProps = {
    paraList: DragAndDropState;
    editParaList: (data: DragAndDropState) => void}