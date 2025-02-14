import React from "react";
import "./ActionButton.css"; // Asegúrate de importar el CSS
import PropTypes from "prop-types";
import icon from "assets/theme/components/icon";

function ActionButton({ data, onClick, icon }) {
    return (
        <button onClick={onClick}>
            <div className="svg-wrapper-1">
                <div className="svg-wrapper">
                    {
                        icon === "IA" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-360q-50 0-85-35t-35-85q0-50 35-85t85-35v-80q0-33 23.5-56.5T240-760h120q0-50 35-85t85-35q50 0 85 35t35 85h120q33 0 56.5 23.5T800-680v80q50 0 85 35t35 85q0 50-35 85t-85 35v160q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200v-160Zm200-80q25 0 42.5-17.5T420-500q0-25-17.5-42.5T360-560q-25 0-42.5 17.5T300-500q0 25 17.5 42.5T360-440Zm240 0q25 0 42.5-17.5T660-500q0-25-17.5-42.5T600-560q-25 0-42.5 17.5T540-500q0 25 17.5 42.5T600-440ZM320-280h320v-80H320v80Zm-80 80h480v-480H240v480Zm240-240Z"/></svg>
                        )
                            :
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                            >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path
                                    fill="currentColor"
                                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                                ></path>
                            </svg>
                    }

                </div>
            </div>
            <span>{data}</span>
        </button>
    );
}

ActionButton.propTypes = {
    data: PropTypes.string.isRequired, // Asegúrate de que sea una cadena requerida
    onClick: PropTypes.func.isRequired, // Asegúrate de que sea una función requerida
    icon: PropTypes.string.isRequired, // Asegúrate de que sea una cadena requerida
};

export default ActionButton;