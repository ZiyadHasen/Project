import React from 'react';
import ImageOne from '../assets/images/imageOne.jpg';

const EventHeroOne = () => {
  return (
    <div>
      <div className='flex justify-center items-center p-20 rounded-md  bg-base-300'>
        <div className=' flex gap-12 lg:flex-row-reverse'>
          <img
            src={ImageOne}
            className='max-w-md  h-[25rem] flex-1 rounded-lg shadow-2xl'
          />
          <div>
            <h1 className='text-5xl  font-bold'>The First Event</h1>
            <p className='py-6'>
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHeroOne;
