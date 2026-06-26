import './CheckBoxCustom.css'

function CheckBoxCustom({label, value, name, id, onChange}){
    return (
        <label className="checkbox__square">
            <input type="checkbox" name={name}
            value={label} id={id} className="visually-hidden" onChange={onChange}/>
            <span className="checkbox__square-span"></span>
            <span className="checkbox__square-label">{label}</span>
        </label>
    )
}

export default CheckBoxCustom