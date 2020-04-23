const enum Customization {
  // name of page to navigate to from overview (the essential page of the app)
  vendorPage = 'VendorHeatingPage',

  // supported device interface - only interact with devices that match exactly this
  interfaceId = '317aadf2-3137-474b-8ddb-fea437c424f4',

  // supported major version of the device interface - only interact with devices that match exactly this
  interfaceVersionMajor = 1,

  // supported minor version of the device interface - only interact with devices that match at least this
  interfaceVersionMinor = 0
}

export default Customization;
