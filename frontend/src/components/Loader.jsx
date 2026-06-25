import './Loader.css'

export default function Loader(){
    return (
        <div className="preloader">
            <div className="preloader-chasing-squares">
              <div className="square"></div>
              <div className="square"></div>
              <div className="square"></div>
              <div className="square"></div>
            </div>
        </div>
    );
}