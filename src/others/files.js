/**
 Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 Copyright (C) 2024-2026 Christophe LEMOINE

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export function humanFileSize(bytes, dp = 1) {
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' o';
    }
    const units = ['Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];
    let u = -1;
    const r = 10 ** dp;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + ' ' + units[u];
}

export function sanitizeFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return "";
    fileName = fileName.trim();
    if (fileName === '.' || fileName === '..' || /^\.+$/.test(fileName)) return fileName;
    if (fileName.startsWith('.') && !fileName.includes('/', 1)) {
        return fileName.toLowerCase();
    }
    const parts = fileName.split('.');
    const hasExtension = parts.length > 1;
    const name = hasExtension ? parts.slice(0, -1).join('.') : fileName;
    const ext = hasExtension ? '.' + parts[parts.length - 1].toLowerCase() : '';
    let sanitized = name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^\x20-\x7E]/g, ""); // Remove non-ASCII characters
    sanitized = sanitized
        .split(/[\s\t\n\r]+/) // Split on any whitespace
        .filter(Boolean) // Remove empty parts
        .join("_"); // Join with underscores
    sanitized = sanitized
        .replace(/[-]+/g, "_") // Convert hyphens to underscores
        .replace(/[&$@=;:+,?()[\]{}'"<>|~!#^*\\\/]/g, "_") // Special handling characters
        .replace(/_+/g, "_") // Collapse multiple underscores into one
        .replace(/^[_\W]+|[_\W]+$/g, "") // Remove leading/trailing underscores and non-word chars
        .toLowerCase(); // Convert to lowercase for consistency
    if (!sanitized && hasExtension) return ext;
    const maxBytes = 900; // Conservative limit below 1,024
    let bytes = 0;
    let truncated = "";
    for (let i = 0; i < sanitized.length; i++) {
        const char = sanitized[i];
        const charBytes = new TextEncoder().encode(char).length;
        if (bytes + charBytes <= maxBytes) {
            truncated += char;
            bytes += charBytes;
        } else {
            break;
        }
    }
    return truncated + ext;

}

export function mimeTypeToExtension(mimetype) {
    const getFileExtention = p => ({ "application/bmp": "bmp", "application/cdr": "cdr", "application/coreldraw": "cdr", "application/excel": "xl", "application/gpg-keys": "gpg", "application/java-archive": "jar", "application/json": "json", "application/mac-binary": "bin", "application/mac-binhex": "hqx", "application/mac-binhex40": "hqx", "application/mac-compactpro": "cpt", "application/macbinary": "bin", "application/msexcel": "xls", "application/msword": "doc", "application/octet-stream": "pdf", "application/oda": "oda", "application/ogg": "ogg", "application/pdf": "pdf", "application/pgp": "pgp", "application/php": "php", "application/pkcs-crl": "crl", "application/pkcs10": "p10", "application/pkcs7-mime": "p7c", "application/pkcs7-signature": "p7s", "application/pkix-cert": "crt", "application/pkix-crl": "crl", "application/postscript": "ai", "application/powerpoint": "ppt", "application/rar": "rar", "application/s-compressed": "zip", "application/smil": "smil", "application/videolan": "vlc", "application/vnd.google-earth.kml+xml": "kml", "application/vnd.google-earth.kmz": "kmz", "application/vnd.mif": "mif", "application/vnd.mpegurl": "m4u", "application/vnd.ms-excel": "xlsx", "application/vnd.ms-office": "ppt", "application/vnd.ms-powerpoint": "ppt", "application/vnd.msexcel": "csv", "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx", "application/vnd.oasis.opendocument.spreadsheet": "ods", "application/wbxml": "wbxml", "application/wmlc": "wmlc", "application/x-binary": "bin", "application/x-binhex40": "hqx", "application/x-bmp": "bmp", "application/x-cdr": "cdr", "application/x-compress": "z", "application/x-compressed": "7zip", "application/x-coreldraw": "cdr", "application/x-director": "dcr", "application/x-dos_ms_excel": "xls", "application/x-dvi": "dvi", "application/x-excel": "xls", "application/x-gtar": "gtar", "application/x-gzip": "gzip", "application/x-gzip-compressed": "tgz", "application/x-httpd-php": "php", "application/x-httpd-php-source": "php", "application/x-jar": "jar", "application/x-java-application": "jar", "application/x-javascript": "js", "application/x-mac-binhex40": "hqx", "application/x-macbinary": "bin", "application/x-ms-excel": "xls", "application/x-msdownload": "exe", "application/x-msexcel": "xls", "application/x-pem-file": "pem", "application/x-photoshop": "psd", "application/x-php": "php", "application/x-pkcs10": "p10", "application/x-pkcs12": "p12", "application/x-pkcs7": "rsa", "application/x-pkcs7-certreqresp": "p7r", "application/x-pkcs7-mime": "p7c", "application/x-pkcs7-signature": "p7a", "application/x-rar": "rar", "application/x-rar-compressed": "rar", "application/x-shockwave-flash": "swf", "application/x-stuffit": "sit", "application/x-tar": "tar", "application/x-troff-msvideo": "avi", "application/x-win-bitmap": "bmp", "application/x-x509-ca-cert": "crt", "application/x-x509-user-cert": "pem", "application/x-xls": "xls", "application/x-zip": "zip", "application/x-zip-compressed": "zip", "application/xhtml+xml": "xhtml", "application/xls": "xls", "application/xml": "xml", "application/xspf+xml": "xspf", "application/zip": "zip", "audio/ac3": "ac3", "audio/aiff": "aif", "audio/midi": "mid", "audio/mp3": "mp3", "audio/mp4": "m4a", "audio/mpeg": "mp3", "audio/mpeg3": "mp3", "audio/mpg": "mp3", "audio/ogg": "ogg", "audio/wav": "wav", "audio/wave": "wav", "audio/x-acc": "aac", "audio/x-aiff": "aif", "audio/x-au": "au", "audio/x-flac": "flac", "audio/x-m4a": "m4a", "audio/x-ms-wma": "wma", "audio/x-pn-realaudio": "ram", "audio/x-pn-realaudio-plugin": "rpm", "audio/x-realaudio": "ra", "audio/x-wav": "wav", "font/otf": "otf", "font/ttf": "ttf", "font/woff": "woff", "font/woff2": "woff2", "image/bmp": "bmp", "image/cdr": "cdr", "image/gif": "gif", "image/jp2": "jp2", "image/jpeg": "jpg", "image/jpm": "jp2", "image/jpx": "jp2", "image/ms-bmp": "bmp", "image/pjpeg": "jpg", "image/png": "png", "image/svg+xml": "svg", "image/tiff": "tiff", "image/vnd.adobe.photoshop": "psd", "image/vnd.microsoft.icon": "ico", "image/webp": "webp", "image/x-bitmap": "bmp", "image/x-bmp": "bmp", "image/x-cdr": "cdr", "image/x-ico": "ico", "image/x-icon": "ico", "image/x-ms-bmp": "bmp", "image/x-png": "png", "image/x-win-bitmap": "bmp", "image/x-windows-bmp": "bmp", "image/x-xbitmap": "bmp", "message/rfc822": "eml", "multipart/x-zip": "zip", "text/calendar": "ics", "text/comma-separated-values": "csv", "text/css": "css", "text/html": "html", "text/json": "json", "text/php": "php", "text/plain": "txt", "text/richtext": "rtx", "text/rtf": "rtf", "text/srt": "srt", "text/vtt": "vtt", "text/x-comma-separated-values": "csv", "text/x-log": "log", "text/x-php": "php", "text/x-scriptzsh": "zsh", "text/x-vcard": "vcf", "text/xml": "xml", "text/xsl": "xsl", "video/3gp": "3gp", "video/3gpp": "3gp", "video/3gpp2": "3g2", "video/avi": "avi", "video/mj2": "jp2", "video/mp4": "mp4", "video/mpeg": "mpeg", "video/msvideo": "avi", "video/ogg": "ogg", "video/quicktime": "mov", "video/vnd.rn-realvideo": "rv", "video/webm": "webm", "video/x-f4v": "f4v", "video/x-flv": "flv", "video/x-ms-asf": "wmv", "video/x-ms-wmv": "wmv", "video/x-msvideo": "avi", "video/x-sgi-movie": "movie", "zz-application/zz-winassoc-cdr": "cdr" }[p]);
    return getFileExtention(mimetype.toLowerCase());
}