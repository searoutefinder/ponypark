import React, { useState, useEffect } from 'react';

const QuestionModal = ({data, buttonText, onButtonClick}) => {
  return (

<div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 bg-[rgba(0,0,0,0.5)]">

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">                    
                            <div className="mt-2">
                                <div className="flex flex-col gap-2">
                                <img 
                                    src={data.treasure_pic_url}
                                    className="w-full h-auto pb-5 rounded-lg"
                                />
                                <p 
                                    className="text-sm text-gray-500 p-3"
                                    dangerouslySetInnerHTML={{ __html: data.treasure_question_nl }}
                                />
                                <p
                                    className="text-sm text-gray-500 bg-[#fffded] p-3 rounded-lg"
                                    dangerouslySetInnerHTML={{ __html: data.treasure_question_de }}
                                />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button 
                      onClick={onButtonClick}
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      {buttonText}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>     

  )
}

export default QuestionModal;