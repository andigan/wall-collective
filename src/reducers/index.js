import { combineReducers } from 'redux';
import deleteTarget from './delete-target';
import selectedImage from './selected-image';
import pageConfig from './page-config';


export default combineReducers({
	pageConfig: pageConfig,
	selectedImage: selectedImage,
	deleteTarget: deleteTarget
});
