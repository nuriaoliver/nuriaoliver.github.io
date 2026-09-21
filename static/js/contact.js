const emailText = document.querySelector("[data-contact-email]");

if (emailText) {
  const encodedAddress = "2;G5R:6% 86QU;2YM:70N961U";
  const addressLength = (encodedAddress.charCodeAt(0) - 32) & 63;
  let address = "";

  for (let index = 1; index < encodedAddress.length; index += 4) {
    const values = [0, 1, 2, 3].map(
      (offset) => (encodedAddress.charCodeAt(index + offset) - 32) & 63,
    );
    const bytes = [
      (values[0] << 2) | (values[1] >> 4),
      ((values[1] & 15) << 4) | (values[2] >> 2),
      ((values[2] & 3) << 6) | values[3],
    ];

    address += String.fromCharCode(...bytes);
  }

  emailText.textContent = address.slice(0, addressLength);
}