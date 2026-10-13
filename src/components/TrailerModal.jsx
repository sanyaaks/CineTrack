import { X } from 'lucide-react';
import Modal from './Modal';

/** Plays a YouTube trailer in a modal. The iframe is removed on close, which stops playback. */
export default function TrailerModal({ open, onClose, video, movieTitle }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="trailer-title" className="modal--video">
      <div className="video-modal">
        <div className="video-modal__header">
          <h2 id="trailer-title" className="video-modal__title">
            {movieTitle} — {video?.name ?? 'Trailer'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close trailer">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {video && (
          <div className="video-modal__frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1&rel=0`}
              title={`${movieTitle} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
