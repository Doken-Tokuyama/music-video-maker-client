import { Fragment, useState, useContext, useEffect } from "react";
import { Switch, Listbox, Transition } from "@headlessui/react";
import NotificationContext from "../context/NotificationContext";
const FileSaver = require("file-saver");

const axios = require("axios");

const MakeMusicVideo = () => {
    const [videoLink, setVideoLink] = useState("");
    const [videoDetails, setVideoDetails] = useState(null);
    const [withWatermark, setWithWatermark] = useState(true);
    const [startTime, setStartTime] = useState("00:00");
    const [endTime, setEndTime] = useState("");

    const [isProcessed, setIsProcessed] = useState(null);

    const backgrounds = [
        {
            id: 1,
            name: "Black (#000000)",
            value: "#000000",
        },
        {
            id: 2,
            name: "White (#FFFFFF)",
            value: "#FFFFFF",
        },
    ];
    const [selectedBackground, setSelectedBackground] = useState(
        backgrounds[0]
    );

    const resolutions = [
        {
            id: 1,
            name: "1080x1920 (9:16)",
            value: {
                width: 1080,
                height: 1920,
            },
        },
        {
            id: 2,
            name: "1920x1080 (16:9)",
            value: {
                width: 1920,
                height: 1080,
            },
        },
    ];
    const [selectedResolution, setSelectedResolution] = useState(
        resolutions[0]
    );

    const { showNotification } = useContext(NotificationContext);

    useEffect(() => {
        if (selectedResolution.name === resolutions[1].name)
            setWithWatermark(false);
        if (selectedResolution.name === resolutions[0].name)
            setWithWatermark(true);
    }, [selectedResolution]);

    const getVideoDetails = async () => {
        setIsProcessed(false);
        await axios
            .get(`${process.env.REACT_APP_SERVER_URL}/?videoLink=${videoLink}`)
            .then(({ data }) => {
                setIsProcessed(null);
                if (data.success) {
                    console.log(data.data);
                    setVideoDetails(data.data);
                } else {
                    showNotification(data?.error?.message);
                    console.error(data?.error?.message);
                }
            });
    };

    const downloadVideo = async () => {
        setIsProcessed(false);
        await axios
            .post(
                process.env.REACT_APP_SERVER_URL,
                {
                    videoLink,
                    startAt: startTime,
                    endAt: endTime,
                    width: selectedResolution.value.width,
                    height: selectedResolution.value.height,
                    background: selectedBackground.value,
                    withWatermark,
                },
                {
                    responseType: "blob",
                }
            )
            .then(({ data }) => {
                setIsProcessed(true);
                showNotification("Processing finished, download started!");
                FileSaver.saveAs(data, "video.mp4");
            })
            .catch((error) => {
                setIsProcessed(null);
                if (error.response) {
                    const type = error.response.data.type;
                    if (type.includes("application/json")) {
                        let reader = new FileReader();
                        reader.addEventListener("loadend", function () {
                            const response = JSON.parse(reader.result);
                            showNotification(response.error.message);
                        });
                        reader.readAsText(error.response.data);
                    }
                    console.log(error);
                } else {
                    showNotification(error.message, "error");
                    console.error(error);
                }
            });
    };

    return (
        <div className="container w-full py-10 lg:py-32 flex flex-col-reverse lg:flex-row items-center justify-between gap-20 lg:gap-10 text-white">
            <div className="w-full">
                <p className="text-3xl">Make Music Video</p>
                <hr className="w-1/2 border-none bg-primary py-1 rounded-lg my-2" />
                <p className="text-xl">
                    Just paste YouTube Video Link and we will make it for you!
                </p>
                <form autoComplete="off" className="my-10 w-full lg:w-2/3">
                    <div className="flex flex-col gap-1 mb-5">
                        <label htmlFor="videoLink" className="text-xl">
                            Video Link:
                        </label>
                        <input
                            type="text"
                            id="videoLink"
                            onChange={(e) => setVideoLink(e.target.value)}
                            value={videoLink}
                            placeholder="https://www.youtube.com/watch?v=..."
                            disabled={videoDetails !== null}
                            className={`w-full text-xl truncate border-2 bg-dark text-white ${
                                videoDetails ? "cursor-not-allowed" : ""
                            } border-transparent focus:border-primary outline-none rounded-lg py-2 px-4`}
                        />
                    </div>
                    {videoDetails && (
                        <>
                            <div className="flex flex-row gap-10 mb-5">
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="background"
                                        className="text-xl"
                                    >
                                        Start time:
                                    </label>
                                    <input
                                        placeholder="MM:SS"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        disabled={
                                            isProcessed === false ? true : false
                                        }
                                        className={`w-full text-xl border-2 bg-dark text-white border-transparent focus:border-primary outline-none rounded-lg py-2 px-4 ${
                                            isProcessed === false
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="background"
                                        className="text-xl"
                                    >
                                        End time:
                                    </label>
                                    <input
                                        placeholder="MM:SS"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                        disabled={
                                            isProcessed === false ? true : false
                                        }
                                        className={`w-full text-xl border-2 bg-dark text-white border-transparent focus:border-primary outline-none rounded-lg py-2 px-4 ${
                                            isProcessed === false
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 mb-5">
                                <label htmlFor="" className="text-xl">
                                    Resolution:
                                </label>
                                <Listbox
                                    value={selectedResolution}
                                    disabled={
                                        isProcessed === false ? true : false
                                    }
                                    onChange={setSelectedResolution}
                                >
                                    <div className="relative">
                                        <Listbox.Button
                                            className={`relative text-xl w-full py-2 pl-3 pr-10 text-left bg-dark rounded-lg shadow-md ${
                                                isProcessed === false
                                                    ? "cursor-not-allowed"
                                                    : "cursor-pointer"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-primary focus-visible:ring-offset-2 focus-visible:border-primary`}
                                        >
                                            <span className="block truncate">
                                                {selectedResolution.name}
                                            </span>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                                    />
                                                </svg>
                                            </span>
                                        </Listbox.Button>
                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="z-10 absolute text-xl w-full py-1 mt-1 overflow-auto bg-dark rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                {resolutions.map(
                                                    (resolution) => (
                                                        <Listbox.Option
                                                            key={resolution.id}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                                                                    active
                                                                        ? "text-white bg-primary"
                                                                        : "text-white"
                                                                }`
                                                            }
                                                            value={resolution}
                                                        >
                                                            {({
                                                                selectedResolution,
                                                            }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${
                                                                            selectedResolution
                                                                                ? "font-medium"
                                                                                : "font-normal"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            resolution.name
                                                                        }
                                                                    </span>
                                                                    {selectedResolution ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-6 w-6"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M5 13l4 4L19 7"
                                                                                />
                                                                            </svg>
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    )
                                                )}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>
                            <div className="flex flex-col gap-1 mb-5">
                                <label htmlFor="" className="text-xl">
                                    Background:
                                </label>
                                <Listbox
                                    value={selectedBackground}
                                    disabled={
                                        isProcessed === false ? true : false
                                    }
                                    onChange={setSelectedBackground}
                                >
                                    <div className="relative">
                                        <Listbox.Button
                                            className={`relative text-xl w-full py-2 pl-3 pr-10 text-left bg-dark rounded-lg shadow-md ${
                                                isProcessed === false
                                                    ? "cursor-not-allowed"
                                                    : "cursor-pointer"
                                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-primary focus-visible:ring-offset-2 focus-visible:border-primary`}
                                        >
                                            <span className="block truncate">
                                                {selectedBackground.name}
                                            </span>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                                    />
                                                </svg>
                                            </span>
                                        </Listbox.Button>
                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="z-10 absolute text-xl w-full py-1 mt-1 overflow-auto bg-dark rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                {backgrounds.map(
                                                    (background) => (
                                                        <Listbox.Option
                                                            key={background.id}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                                                                    active
                                                                        ? "text-white bg-primary"
                                                                        : "text-white"
                                                                }`
                                                            }
                                                            value={background}
                                                        >
                                                            {({
                                                                selectedBackground,
                                                            }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${
                                                                            selectedBackground
                                                                                ? "font-medium"
                                                                                : "font-normal"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            background.name
                                                                        }
                                                                    </span>
                                                                    {selectedBackground ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-6 w-6"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M5 13l4 4L19 7"
                                                                                />
                                                                            </svg>
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    )
                                                )}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>
                            <div className="flex flex-row items-center gap-5 mb-5">
                                <label
                                    htmlFor="withWatermark"
                                    className="text-xl leading-loose"
                                >
                                    Include Watermark:
                                </label>
                                <Switch
                                    id="withWatermark"
                                    checked={withWatermark}
                                    disabled={
                                        isProcessed === false ||
                                        selectedResolution.name ===
                                            resolutions[1].name
                                            ? true
                                            : false
                                    }
                                    onChange={setWithWatermark}
                                    className={`${
                                        withWatermark ? "bg-primary" : "bg-dark"
                                    }
          relative inline-flex flex-shrink-0 h-[38px] w-[74px] border-2 border-transparent rounded-full ${
              isProcessed === false ||
              selectedResolution.name === resolutions[1].name
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
          } transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                                >
                                    <span className="sr-only">Use setting</span>
                                    <span
                                        aria-hidden="true"
                                        className={`${
                                            withWatermark
                                                ? "translate-x-9"
                                                : "translate-x-0"
                                        }
            pointer-events-none inline-block h-[34px] w-[34px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
                                    />
                                </Switch>
                            </div>
                        </>
                    )}
                </form>
                <div className="flex items-center justify-start">
                    <p
                        className={`px-6 py-3 text-2xl ${
                            videoLink ? "bg-primary" : "bg-dark"
                        } flex items-center justify-start gap-3 rounded-lg select-none ${
                            videoLink ? "cursor-pointer" : ""
                        }`}
                        onClick={
                            videoDetails
                                ? isProcessed === false
                                    ? () => {
                                          showNotification(
                                              "Already processing, please wait!"
                                          );
                                      }
                                    : downloadVideo
                                : getVideoDetails
                        }
                    >
                        {videoDetails ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                />
                            </svg>
                        )}
                        {videoDetails
                            ? isProcessed === false
                                ? "Processing..."
                                : "Downlaod"
                            : isProcessed === false
                            ? "Loading..."
                            : "Next"}
                    </p>
                    {videoDetails && isProcessed !== false && (
                        <p
                            className={`ml-5 text-2xl inline rounded-lg select-none cursor-pointer`}
                            onClick={() => {
                                setVideoLink("");
                                setVideoDetails(null);
                                setStartTime("00:00");
                                setEndTime("");
                                setSelectedResolution(resolutions[0]);
                                setSelectedBackground(backgrounds[0]);
                                setWithWatermark(true);
                            }}
                        >
                            Go Back
                        </p>
                    )}
                </div>
            </div>
            <div className="w-full">
                {videoDetails ? (
                    <div className="bg-dark rounded-lg p-5 flex flex-col justify-center">
                        <a
                            href={videoDetails.video_url}
                            target="_blank"
                            rel="noreferrer"
                            draggable={false}
                        >
                            <img
                                className="w-full rounded-lg select-none cursor-pointer"
                                src={
                                    videoDetails.thumbnails[
                                        videoDetails.thumbnails.length - 1
                                    ].url
                                }
                                draggable={false}
                                alt={`${videoDetails.title} - Thumbnail`}
                            />
                        </a>
                        <p className="text-2xl mt-5">{videoDetails.title}</p>
                        <p className="text-xl">
                            {videoDetails.ownerChannelName}
                        </p>
                    </div>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        data-name="Layer 1"
                        viewBox="0 0 876.97244 744"
                        className="w-full select-none"
                    >
                        <path
                            d="M676.51378,269h-26a5.00573,5.00573,0,0,1-5-5V238a5.00573,5.00573,0,0,1,5-5h26a5.00573,5.00573,0,0,1,5,5v26A5.00573,5.00573,0,0,1,676.51378,269Zm-26-34a3.00328,3.00328,0,0,0-3,3v26a3.00328,3.00328,0,0,0,3,3h26a3.00328,3.00328,0,0,0,3-3V238a3.00328,3.00328,0,0,0-3-3Z"
                            transform="translate(-161.51378 -78)"
                            fill="#e6e6e6"
                        />
                        <path
                            d="M373.51378,114h-26a5.00573,5.00573,0,0,1-5-5V83a5.00573,5.00573,0,0,1,5-5h26a5.00573,5.00573,0,0,1,5,5v26A5.00573,5.00573,0,0,1,373.51378,114Zm-26-34a3.00328,3.00328,0,0,0-3,3v26a3.00328,3.00328,0,0,0,3,3h26a3.00328,3.00328,0,0,0,3-3V83a3.00328,3.00328,0,0,0-3-3Z"
                            transform="translate(-161.51378 -78)"
                            fill="#e6e6e6"
                        />
                        <path
                            d="M660.51378,256h-26a5.00573,5.00573,0,0,1-5-5V225a5.00573,5.00573,0,0,1,5-5h26a5.00573,5.00573,0,0,1,5,5v26A5.00573,5.00573,0,0,1,660.51378,256Zm-26-34a3.00328,3.00328,0,0,0-3,3v26a3.00328,3.00328,0,0,0,3,3h26a3.00328,3.00328,0,0,0,3-3V225a3.00328,3.00328,0,0,0-3-3Z"
                            transform="translate(-161.51378 -78)"
                            fill="#e6e6e6"
                        />
                        <path
                            d="M208.51378,473h-26a5.00573,5.00573,0,0,1-5-5V442a5.00573,5.00573,0,0,1,5-5h26a5.00573,5.00573,0,0,1,5,5v26A5.00573,5.00573,0,0,1,208.51378,473Zm-26-34a3.00328,3.00328,0,0,0-3,3v26a3.00328,3.00328,0,0,0,3,3h26a3.00328,3.00328,0,0,0,3-3V442a3.00328,3.00328,0,0,0-3-3Z"
                            transform="translate(-161.51378 -78)"
                            fill="#e6e6e6"
                        />
                        <path
                            d="M192.51378,460h-26a5.00573,5.00573,0,0,1-5-5V429a5.00573,5.00573,0,0,1,5-5h26a5.00573,5.00573,0,0,1,5,5v26A5.00573,5.00573,0,0,1,192.51378,460Zm-26-34a3.00328,3.00328,0,0,0-3,3v26a3.00328,3.00328,0,0,0,3,3h26a3.00328,3.00328,0,0,0,3-3V429a3.00328,3.00328,0,0,0-3-3Z"
                            transform="translate(-161.51378 -78)"
                            fill="#e6e6e6"
                        />
                        <path
                            d="M253.94313,164.03859H494.55862a51.15008,51.15008,0,0,1,49.89777,39.90062L666.03464,743.20648a41.34046,41.34046,0,0,1-38.29383,50.38232L380.38648,805.77594A54.61491,54.61491,0,0,1,323.956,760.94848l-68.96659-381.268-5.13082,1.466-13.19613-72.26456,5.28146-1.32037L222.69293,201.136a31.49278,31.49278,0,0,1,31.2502-37.09738Z"
                            transform="translate(-161.51378 -78)"
                            fill="#3f3d56"
                        />
                        <path
                            d="M462.882,175.66378h28.08707a35.34863,35.34863,0,0,1,34.53616,27.81348L642.20364,738.34478a21.90324,21.90324,0,0,1-19.9674,26.52539l-246.55417,16.159a28.36684,28.36684,0,0,1-29.77274-23.27746L246.32983,204.914a24.84579,24.84579,0,0,1,24.45228-29.25017h26.645a11.72585,11.72585,0,0,1,11.32267,8.67742h0a10.35184,10.35184,0,0,0,9.99591,7.66063H445.23883a17.69522,17.69522,0,0,0,17.6431-16.33806Z"
                            transform="translate(-161.51378 -78)"
                            fill="#fff"
                        />
                        <polygon
                            points="104 188.606 371.476 188.606 399.971 317 129 322 104 188.606"
                            fill="#da0037"
                        />
                        <polygon
                            points="358 431.754 420.971 431.754 422.971 443.809 360 443.809 358 431.754"
                            fill="#da0037"
                        />
                        <rect
                            x="303.6674"
                            y="451.08379"
                            width="267.12453"
                            height="1.25708"
                            transform="translate(-170.9793 -68.64185) rotate(-1.21314)"
                            fill="#2f2e41"
                        />
                        <rect
                            x="306.80298"
                            y="488.47287"
                            width="272.16437"
                            height="1.25714"
                            transform="translate(-172.68833 -67.64407) rotate(-1.32299)"
                            fill="#2f2e41"
                        />
                        <polygon
                            points="384 560.754 446.971 560.754 448.971 572.809 386 572.809 384 560.754"
                            fill="#da0037"
                        />
                        <rect
                            x="329.6674"
                            y="580.08379"
                            width="267.12453"
                            height="1.25708"
                            transform="translate(-173.70462 -68.06247) rotate(-1.21314)"
                            fill="#2f2e41"
                        />
                        <rect
                            x="332.80298"
                            y="617.47287"
                            width="272.16437"
                            height="1.25714"
                            transform="translate(-175.65981 -67.00938) rotate(-1.32299)"
                            fill="#2f2e41"
                        />
                        <polygon
                            points="615.56 731.207 603.645 731.206 597.977 685.249 615.562 685.25 615.56 731.207"
                            fill="#a0616a"
                        />
                        <path
                            d="M780.11212,820.75659l-38.41869-.00142v-.48593a14.95444,14.95444,0,0,1,14.95363-14.95339h.00095l23.46482.00095Z"
                            transform="translate(-161.51378 -78)"
                            fill="#2f2e41"
                        />
                        <polygon
                            points="763.576 723.405 751.979 726.136 735.926 682.702 753.043 678.671 763.576 723.405"
                            fill="#a0616a"
                        />
                        <path
                            d="M930.69546,811.95075l-37.39588,8.80584-.1114-.473a14.95441,14.95441,0,0,1,11.12743-17.98318l.00093-.00022,22.84015-5.37823Z"
                            transform="translate(-161.51378 -78)"
                            fill="#2f2e41"
                        />
                        <path
                            d="M774.639,615.36636c.02257-2.39517.732-58.91549,16.2249-80.28637l.22915-.31528,53.992,7.44866-1.20743,11.86268c2.37482,2.31,21.055,21.82982,26.44916,68.05373l57.30791,153.91483-26.64209,2.42186L822.12727,610.44889,780.39208,793.0841H753.98074Z"
                            transform="translate(-161.51378 -78)"
                            fill="#2f2e41"
                        />
                        <path
                            d="M784.53881,537.165l5.27788-27.70841c-1.033-1.3298-5.611-7.71691-4.592-15.20371.66458-4.88441,3.58036-9.16748,8.66786-12.73353l13.68-31.92029.18434-.10806c.92139-.54286,22.70259-13.13782,34.577-1.2548.29685.23011,29.53339,23.43805,17.79275,54.74556L845.633,546.4672Z"
                            transform="translate(-161.51378 -78)"
                            fill="#ccc"
                        />
                        <path
                            d="M766.17651,574.652a9.79821,9.79821,0,0,0,8.27541-12.53988l28.25071-20.35415-16.91194-6.4327-24.23457,20.31485a9.85129,9.85129,0,0,0,4.62039,19.01188Z"
                            transform="translate(-161.51378 -78)"
                            fill="#a0616a"
                        />
                        <path
                            d="M771.36857,541.72518l43.13015-33.9811-12.82221-43.80839a15.73981,15.73981,0,0,1,1.58883-12.45766,14.55826,14.55826,0,0,1,9.54634-6.89055c7.3835-1.56245,14.08622,2.57188,19.91712,12.28984l.0445.08772c.96461,2.3583,23.4336,57.901,6.27714,69.77891-16.78269,11.61859-55.69936,28.53222-56.09061,28.70258l-.45641.19706Z"
                            transform="translate(-161.51378 -78)"
                            fill="#ccc"
                        />
                        <circle
                            cx="667.17682"
                            cy="332.5559"
                            r="26.12766"
                            fill="#a0616a"
                        />
                        <circle
                            cx="708.13866"
                            cy="300.11435"
                            r="23.11435"
                            fill="#2f2e41"
                        />
                        <path
                            d="M889.58978,397.25451a23.11558,23.11558,0,0,1-35.69469-12.137,23.11562,23.11562,0,1,0,45.08988-9.479A23.1071,23.1071,0,0,1,889.58978,397.25451Z"
                            transform="translate(-161.51378 -78)"
                            fill="#2f2e41"
                        />
                        <path
                            d="M798.37034,397.2802c4.03517-7.22412,5.57918-10.24183,10.78206-14.63472,4.6009-3.88507,10.26018-5.026,14.82486-1.34482a27.33647,27.33647,0,1,1-16.4941,25.09235,27.56231,27.56231,0,0,1,.18625-3.091C803.70162,402.7448,802.33813,397.83743,798.37034,397.2802Z"
                            transform="translate(-161.51378 -78)"
                            fill="#2f2e41"
                        />
                        <path
                            d="M1037.48622,822h-381a1,1,0,0,1,0-2h381a1,1,0,0,1,0,2Z"
                            transform="translate(-161.51378 -78)"
                            fill="#3f3d56"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default MakeMusicVideo;
