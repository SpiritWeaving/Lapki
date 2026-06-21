import './DeleteModal.css'

export default function DeleteModal(){
    return (
       <div className="popup popup_type_remove-card">
           <div className="popup__content">
             <button type="button" className="popup__close"></button>
             <h3 className="popup__title">Вы уверены?</h3>
             <form className="popup__form" name="remove-card" noValidate>
               <button
                 type="submit"
                 className="button popup__button"
               >
                 Да
               </button>
              </form>
           </div>
      </div>
    );
}