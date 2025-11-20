import React from 'react';
import './PrepInstructions.css';

function PrepInstructions({ prepInstructions }) {
  if (!prepInstructions) return null;

  return (
    <div className="prep-instructions">
      <h2>📋 Prep Day Instructions</h2>
      
      {prepInstructions.overview && (
        <div className="prep-overview">
          <p>{prepInstructions.overview}</p>
        </div>
      )}

      {prepInstructions.steps && prepInstructions.steps.length > 0 && (
        <div className="prep-steps">
          <h3>Step-by-Step Guide</h3>
          <ol>
            {prepInstructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="prep-tips">
        <h3>💡 Pro Tips</h3>
        <ul>
          <li>Label all containers with the meal name and date</li>
          <li>Store meals in clear containers for easy identification</li>
          <li>Keep raw and cooked foods separate during prep</li>
          <li>Most prepared meals stay fresh for 4-5 days in the fridge</li>
          <li>Consider freezing meals for later in the week</li>
        </ul>
      </div>
    </div>
  );
}

export default PrepInstructions;
