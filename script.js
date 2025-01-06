const apiKey = 'AIzaSyDak7hxw2r7gZw6hF-F4PDMMhCMkqilHOc'; // Replace with your YouTube API key

function searchCaption() {
    const youtubeLink = document.getElementById('youtube-link').value;
    const searchText = document.getElementById('search-text').value;
    const videoId = extractVideoId(youtubeLink);

    if (!videoId) {
        alert('Invalid YouTube link');
        return;
    }

    fetchCaptions(videoId, searchText);
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function fetchCaptions(videoId, searchText) {
    const url = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const captionId = data.items[0].id;
            const captionUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`;
            const captionResponse = await fetch(captionUrl);
            const captionData = await captionResponse.json();

            const captions = captionData.items[0].snippet.trackKind;
            const captionText = captionData.items[0].snippet.title;

            const time = searchInCaptions(captionText, searchText);
            if (time) {
                window.location.href = `https://www.youtube.com/watch?v=${videoId}&t=${time}s`;
            } else {
                document.getElementById('result').innerText = 'Text not found in captions.';
            }
        } else {
            document.getElementById('result').innerText = 'No captions found for this video.';
        }
    } catch (error) {
        console.error('Error fetching captions:', error);
        document.getElementById('result').innerText = 'Error fetching captions.';
    }
}

function searchInCaptions(captions, searchText) {
    const lines = captions.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchText)) {
            const time = lines[i].match(/\d+:\d+/)[0];
            const [minutes, seconds] = time.split(':');
            return parseInt(minutes) * 60 + parseInt(seconds);
        }
    }
    return null;
}
