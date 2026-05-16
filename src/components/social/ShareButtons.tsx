import { FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import './ShareButtons.css';

interface ShareButtonsProps {
  text: string;
  url?: string;
}

function ShareButtons({ text, url = window.location.href }: ShareButtonsProps) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="share-buttons-container">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button twitter"
      >
        <FaTwitter />
        <span>Tweet</span>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button facebook"
      >
        <FaFacebook />
        <span>Compartir</span>
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button whatsapp"
      >
        <FaWhatsapp />
        <span>Enviar</span>
      </a>
    </div>
  );
}

export default ShareButtons;
