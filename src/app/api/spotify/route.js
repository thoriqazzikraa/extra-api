const { NextResponse } = require("next/server");
const axios = require("axios")

const FailedStatus = {
    status: false,
    message: 'No query or url parameter',
}

const endpoint = 'https://sa.caliph.eu.org/api'

export async function GET(request) {
    const params = param => request.nextUrl.searchParams.get(param)
    const query = params('query')
    const url = params('url')

    if (!query&&!url) return NextResponse.json(FailedStatus, {status: 400, statusText: 'No query or url parameter'})

    async function getLyrics(id) {
        try {
            const { data } = await axios.get(`https://spotify-lyric-api.herokuapp.com/?trackid=${id}&format=lrc`)
            return data.lines
        } catch (error) {
            console.log(error);
            return []
        }
    }


    if (query) {
        try {
            const { data } = await axios.get(`${endpoint}/search/tracks?q=${query}`)
            if (data < 1) return NextResponse.json({ status: false, message: 'Not found' }, { status: 404, statusText: 'Song not found' }) 
            return NextResponse.json({
                status: true,
                message: 'success',
                data
            }, { status: 200 })
        } catch (error) {
            return NextResponse.json({ status: false, message: error.message}, { status: 500, statusText: error.message })
        }
    } else {
        try {
            const { data } = await axios.get(`${endpoint}/info/track?url=${url}`)
            const lyrics = await getLyrics(data.id)
            if (data < 1) return NextResponse.json({ status: false, message: 'Not found' }, { status: 404, statusText: 'Track not found' }) 
            return NextResponse.json({
                status: true,
                message: 'success',
                data,
                lyrics
            }, { status: 200})
        } catch (error) {
            return NextResponse.json({ status: false, message: error.message}, { status: 500, statusText: error.message })
        }
    }


  }