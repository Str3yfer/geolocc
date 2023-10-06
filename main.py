import pygeoip, requests, urllib3
import os, random, json
import platform
from termcolor import colored
import webbrowser
from datetime import datetime
import shutil
import ngrok

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def get_platform():
    return platform.system()


def clear_console(systemName):
    if systemName == "Linux":
        os.system("clear")
    if systemName == "Windows":
        os.system("cls")


def change_console_title(title):
    if (get_platform() == "Windows"):
        os.system(f"title {title}")


def menu(type):
    if type == "logo":
        titleColors = (
            "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "light_grey", "dark_grey",
            "light_red",
            "light_green", "light_yellow", "light_blue", "light_magenta", "light_cyan")
        selectedTitleColor = titleColors[random.randint(1, len(titleColors) - 1)]
        clear_console(get_platform())
        print(colored(r""" 
             /\  \\
            //\\  \\           //=========     //==========     //======\\     ||              //======\\      //========     //======== 
           //\ \\  \\         //              ||               ||        ||    ||             ||        ||    //             //
          // \\ \\  \\       ||               ||               ||        ||    ||             ||        ||   ||             ||
         //   \\ \\  \\      ||   =======     ||===========    ||        ||    ||             ||        ||   ||             ||
        //     \\ \\  \\     ||         =     ||               ||        ||    ||             ||        ||   ||             ||
       //       \\ \\  \\     \\         =    ||               ||        ||    ||             ||        ||    \\             \\
      //         \\ \\  \\     \\=========     \\==========     \\======//      \\=========    \\======//      \\========     \\========
     //           \\ \\  \\
        """, selectedTitleColor))
    if type == "main":
        change_console_title("GEOLOCC_")
        menu("logo")
        print(
            "\n\n\n=============================\n==      1. Get IP          ==\n==      2. Get Location    =="
            "\n==      3. Open Site       ==\n==      4. Settings        ==\n==      5. Exit            =="
            "\n=============================\n")
        userInput = input(": ")
        if userInput == "1":
            GEOLOCC().getIp()
        elif userInput == "2":
            GEOLOCC().getLocation()
        elif userInput == "3":
            change_console_title("GEOLOCC_ LOCALSERVER")
            PORT = input("PORT (def. 8080): ")
            try:
                if PORT == "":
                    PORT = 8080
                else:
                    PORT = int(PORT)
            except:
                menu("main")
            if PORT < 1 or PORT > 65535:
                PORT = 8080
            change_console_title(f"GEOLOCC_ LOCALSERVER (STARTING) / PORT {PORT}")
            print("(CTRL + C) to exit".center(shutil.get_terminal_size().columns * 2 - 25))
            webbrowser.open(f"http://localhost:{PORT}/website/geolocc.html")
            os.system(f"php -S 127.0.0.1:{PORT}")
            menu("main")
        elif userInput == "4":
            GEOLOCC().settins()
        elif userInput == "5":
            menu("exit")
        else:
            menu("main")
    if type == "afterSearch":
        print(
            "\n\n\n=============================\n==       1. Home           ==\n==       2. Restart        =="
            "\n==       3. Exit           ==\n=============================\n")
        userInput = input(": ")
        if userInput == "1":
            menu("main")
        elif userInput == "2":
            GEOLOCC().getLocation()
        elif userInput == "3":
            menu("exit")
        else:
            menu("main")

    if type == "exit":
        exit(10000)


class GEOLOCC:
    def __init__(self):
        self.ip = None
        self.geofile = None
        self.responses = None

    def settins(self):
        menu("main")

    def getIp(self):
        global token
        clear_console(get_platform())
        menu("logo")
        change_console_title("GEOLOCC_ + GetIP")
        print(
            "\n\n\n=============================\n==   1. Get IP             ==\n==   2. Change ngrok aKey  =="
            "\n==   3. Back               =="
            "\n=============================\n")
        userInput = input(": ")
        if userInput == "1":
            clear_console(get_platform())
            menu("logo")
            token = ""
            with open("logs/ngrok/authtoken.txt", "r") as outfile:
                fileRead = outfile.read()
                if fileRead == "":
                    token = input("Enter your ngrok authtoken: ")
                    with open("logs/ngrok/authtoken.txt", "w") as outfile:
                        outfile.write(token)
                else:
                    token = fileRead
            PORT = input("PORT (def. 8080): ")
            try:
                if PORT == "":
                    PORT = 8080
                else:
                    PORT = int(PORT)
            except:
                menu("main")
            if PORT < 1 or PORT > 65535:
                PORT = 8080
            try:
                listener = ngrok.connect(PORT, authtoken=token)
                print(f"{colored('Site URL:', 'green')} {colored(f'{listener.url()}/home.php', 'red')}")
                os.system(f"php -S 127.0.0.1:{PORT} -t host")
            except TypeError as err:
                clear_console(get_platform())
                print(colored("! An error occurred during server configuration and startup. "
                              "\n - Check if you have PHP installed."
                              "\n - Check if you have ngrok installed."
                              "\n - Check if you have all other modules/libraries installed. "
                              "python -m pip install -r requirements.txt",
                              "red"))
                input(colored("\n\nENTER to return home_", "green"))
                menu("main")
        elif userInput == "2":
            clear_console(get_platform())
            menu("logo")
            token = input("Enter your ngrok authtoken: ")
            if token != "":
                with open("logs/ngrok/authtoken.txt", "w") as outfile:
                    outfile.write(token)
            menu("main")
        elif userInput == "3":
            menu("main")
        else:
            menu("main")


    def getLocation(self):
        global validateFile
        change_console_title("GEOLOCC_ + GetLocation")
        systemName = platform.system()

        clear_console(systemName)
        menu("logo")

        try:
            self.geofile = pygeoip.GeoIP("geo.dat")
        except:
            print("Unable to open 'geo.dat' file")

        self.ip = input("IP Address (-1 == exit): ")

        if self.ip == "":
            self.ip = "127.0.0.1"

        if self.ip == "-1":
            menu("main")

        clear_console(systemName)

        change_console_title(f"GEOLOCC_ + GetLocation ({self.ip})")

        try:
            self.responses = [
                self.geofile.record_by_addr(self.ip),
                # requests.get(url=f"http://ip-api.com/json/{self.ip}", verify=False).json(),
                # requests.get(url=f"https://ipinfo.io/{self.ip}/json", verify=False).json(),
                # requests.get(url=f"https://geolocation-db.com/json/{self.ip}/&position=true").json()
            ]

            countResponse = 0
            jsonSave = {
                self.ip: {}
            }

            for response in self.responses:
                countResponse += 1

                print(colored(f"\n\nMETHOD {countResponse}\n\n", "red"))
                response["date"] = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
                jsonSave[self.ip][f"method{countResponse}"] = response
                try:
                    for a, b in response.items():
                        color = "white"
                        print("X [ " + colored(f"{a} => {b}", color) + " ]")
                except:
                    print(colored("An error occurred while executing the process.", "red"))

            validateFile = False
            with open("logs/location/logs.json") as openfile:
                if openfile.read() != "":
                    print(openfile.read())
                    validateFile = True

            try:
                if validateFile:
                    with open("logs/location/logs.json") as openfile:
                        json_object = json.load(openfile)

                    json_object.update(jsonSave)

                    json_object = json.dumps(json_object)
                else:
                    json_object = json.dumps(jsonSave)

                with open("logs/location/logs.json", "w") as outfile:
                    outfile.write(json_object)
            except:
                print(colored("! An error occurred while writing information to the log file. "
                              "\n - To fix this, delete everything from the logs/location/logs.json file "
                              "(it should be empty).",
                              "red"))

            menu("afterSearch")

        except:
            clear_console(get_platform())
            print(colored(f"An error occurred while performing an operation.", "red"))
            input(colored("\n\nENTER to return home_", "green"))
            menu("main")


if __name__ == '__main__':
    os.system("title GEOLOCC_")
    os.system('mode con: cols=150 lines=40')
    menu("main")
