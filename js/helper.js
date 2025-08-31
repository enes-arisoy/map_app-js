import {
  goToIcon,
  homeIcon,
  jobIcon,
  parkIcon,
  personIcon,
} from "./constants.js";

// note status'e göre icon döndüren fonksiyon
const getStatusIcon = (status) => {
  switch (status) {
    case "Parking":
      return parkIcon;
    case "Home":
      return homeIcon;
    case "Job":
      return jobIcon;
    case "Visiting":
      return goToIcon;
    default:
      return personIcon; // varsayılan ikon
  }
};

export default getStatusIcon;
