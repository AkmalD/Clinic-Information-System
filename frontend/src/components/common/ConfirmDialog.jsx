import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({
  open, title, description, onConfirm, onCancel, loading,
  confirmLabel = 'Hapus', loadingLabel = 'Menghapus...', confirmColor = 'error',
}) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Batal</Button>
        <Button color={confirmColor} variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? loadingLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}