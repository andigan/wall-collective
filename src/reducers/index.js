import { combineReducers } from 'redux';
import deleteTarget from './delete-target';
import selectedImage from './selected-image';


export default combineReducers({
	selectedImage: selectedImage,
	deleteTarget: deleteTarget
});
