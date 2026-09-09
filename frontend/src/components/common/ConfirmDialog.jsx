import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, loading }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Batal</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? 'Menghapus...' : 'Hapus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}