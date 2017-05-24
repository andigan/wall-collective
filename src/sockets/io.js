import initialIO from './initial-io';
import imageIO from './image-io';
import viewIO from './view-io';

export function IOInit() {
  // set socket location
  // io.connect('http://localhost:8000'); || io.connect('http://www.domain_name.com');
  let socket = io.connect([location.protocol, '//', location.host, location.pathname].join(''));

  initialIO(socket);
  imageIO(socket);
  viewIO(socket);

  return socket;
};
