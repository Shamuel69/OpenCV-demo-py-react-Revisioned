import cv2

# Filters

# □ Gaussian

# □ Median

# □ Bilateral

# ----------------

# Detection

# □ Canny

# □ Threshold

# ----------------

# Adjustments

# Brightness

# Contrast

# Gamma

class CV2attributes:
    def __init__(self, image, config):
        self.queue = ["GB", "MB", "BB", "CF"]
        self.config = config
        self.image = image
        self.height, self.width, self.channels = self.image.shape 
        self.result = self.combined()

    def combined(self):
        
        order = self.config.keys()
        new_order = []
        for key in self.queue:
            if key in order:
                new_order.append(key)
        order = new_order

        for key in order:
            self.config[key] = self.repair_file(key=key)
            if key == "GB":
                self.image = self.apply_gaussian_filter(kernel_size=[self.config[key]["kernalsize"], self.config[key]["kernalsize"]]) 
            if key == "MB":
                self.image = self.apply_median_filter(kernel_size=self.config[key]["kernalsize"])
            if key == "BB":
                try:
                    print("Applying Bilateral Filter with parameters: ", self.config[key])
                    self.image = self.apply_bitlateral_filter(diameter=self.config[key]["diameter"], sigma_color=self.config[key]["sigmaColor"], sigma_space=self.config[key]["sigmaSpace"])
                except:
                    print("WUH WOH: ", self.config[key])
            if key == "CF":
                gray_image = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)
                self.image = cv2.Canny(gray_image, self.config[key]["threshold1"], self.config[key]["threshold2"])

        return self.image

    def repair_file(self, key="BB"):
        if key == "CF":
            results = self.threshold_checker(self.config["CF"]["threshold1"], self.config["CF"]["threshold2"])
            self.config["CF"]["threshold1"] = results[0]
            self.config["CF"]["threshold2"] = results[1]
            return self.config["CF"]


        elif key == "BB":
            default = {"diameter": 9, "sigmaColor": 75, "sigmaSpace": 75}
            current = self.config["BB"]
            self.config["BB"] = default | current
            return self.config["BB"]

        else: return self.config[key]

    def threshold_checker(self, threshold1, threshold2)-> tuple[int, int]: 
        if threshold1 > threshold2:
            return threshold2, threshold1
        else:
            return threshold1, threshold2
        
    def apply_blur(self, kernel_size=(5, 5)):
        return cv2.blur(self.image, kernel_size)

    def display_attributes(self):
        return {"Dimensions": [self.width, self.height], "Channels": self.channels}

    def apply_gaussian_filter(self, kernel_size=(5, 5)):
        return cv2.GaussianBlur(self.image, kernel_size, 0)

    def apply_median_filter(self, kernel_size=5):
        return cv2.medianBlur(self.image, kernel_size)
    def apply_bitlateral_filter(self, diameter=9, sigma_color=75, sigma_space=75):

        return cv2.bilateralFilter(self.image, diameter, sigma_color, sigma_space)