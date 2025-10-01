"use client";

import Image from 'next/image';

export function ArticleHeader(props) {
    const content = props?.content
    return (
        <main className="max-w-3xl mx-auto px-4 py-10">
        {content?.heroImage ? (
            <div className="mb-6 overflow-hidden rounded-lg">
            <Image
                src={content?.heroImage}
                alt={content?.title}
                width={1200}
                height={630}
                sizes="100vw"
                className="w-full h-auto object-cover"
            />
            </div>
        ) : null}
        <h1 className="text-4xl font-bold mb-2">{content?.title}</h1>
        {content?.displayDate ? (
            <p className="text-sm text-gray-500 mb-6">{content?.displayDate}</p>
        ) : null}
        <br/>
        <div dangerouslySetInnerHTML={{ __html: content?.description }} />
        <br/>
        <br/><br/>
        <br/>
        <div dangerouslySetInnerHTML={{ __html: content?.body }} />
        </main>
    );
}