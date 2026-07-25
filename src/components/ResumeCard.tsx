import { useEffect, useState } from 'react';
import { useNavigate } from '../lib/router';
import { usePuterStore } from '../lib/puter';
import ScoreCircle from './ScoreCircle';

export default function ResumeCard({ resume }: { resume: Resume }) {
  const { id, companyName, jobTitle, feedback, imagePath } = resume;
  const { fs } = usePuterStore();
  const { navigate } = useNavigate();
  const [imgUrl, setImgUrl] = useState('');

  useEffect(() => {
    fs.read(imagePath).then((blob) => {
      if (blob) setImgUrl(URL.createObjectURL(blob));
    });
  }, [imagePath]);

  return (
    <div
      onClick={() => navigate(`/resume/${id}`)}
      className="resume-card cursor-pointer hover:shadow-lg transition-shadow duration-200"
      style={{ animation: 'fadeIn 0.6s ease-in' }}
    >
      <div className="resume-card-header">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {companyName && <h2 className="!text-black font-bold truncate" style={{ WebkitTextFillColor: '#000', color: '#000' }}>{companyName}</h2>}
          {jobTitle && <p className="text-lg text-gray-500 truncate">{jobTitle}</p>}
          {!companyName && !jobTitle && <h2 className="!text-black font-bold" style={{ WebkitTextFillColor: '#000', color: '#000' }}>Resume</h2>}
        </div>
        <div className="flex-shrink-0 ml-2">
          <ScoreCircle score={feedback?.overallScore ?? 0} />
        </div>
      </div>
      {imgUrl ? (
        <div className="gradient-border flex-1">
          <img src={imgUrl} alt="resume preview" className="w-full h-[350px] object-cover object-top rounded-xl" />
        </div>
      ) : (
        <div className="gradient-border flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
