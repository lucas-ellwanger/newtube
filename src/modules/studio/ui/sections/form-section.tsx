"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorBoundary } from "react-error-boundary";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";

import { trpc } from "@/trpc/client";
import { snakeCaseToTitle } from "@/lib/utils";
import { videoUpdateSchema } from "@/db/schema";
import { THUMBNAIL_FALLBACK } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";

import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";

interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return <div>Loading...</div>;
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);

  const router = useRouter();
  const utils = trpc.useUtils();

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const update = trpc.videos.update.useMutation({
    onMutate: () => {
      const toastId = toast.loading("Saving changes...");
      return { toastId };
    },
    onSuccess: (_, __, { toastId }) => {
      utils.studio.getOne.invalidate({ id: videoId });
      utils.studio.getMany.invalidate();
      toast.success("Video updated", { id: toastId });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const remove = trpc.videos.remove.useMutation({
    onMutate: () => {
      const toastId = toast.loading("Deleting video...");
      return { toastId };
    },
    onSuccess: (_, __, { toastId }) => {
      utils.studio.getMany.invalidate();
      toast.success("Video deleted", { id: toastId });
      router.push("/studio");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onMutate: () => {
      const toastId = toast.loading("Restoring thumbnail...");
      return { toastId };
    },
    onSuccess: (_, __, { toastId }) => {
      utils.studio.getOne.invalidate({ id: videoId });
      utils.studio.getMany.invalidate();
      toast.success("Thumbnail restored", { id: toastId });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onMutate: () => {
      const toastId = toast.loading("Processing task...");
      return { toastId };
    },
    onSuccess: (_, __, { toastId }) => {
      toast.success("Background job started", {
        description: "This may take some time",
        id: toastId,
      });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutateAsync(data);
  };

  // TODO: Change if deploying outside vercel
  const fullUrl = `${
    process.env.VERCEL_URL || "http://localhost:3000"
  }/videos/${videoId}`;

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <>
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your video details
              </p>
            </div>

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8}>
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: videoId })}
                  >
                    <TrashIcon className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title
                      {/* TODO: Add AI generate button */}
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                      {/* TODO: Add AI generate button */}
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={10}
                        className="resize-none pr-10"
                        placeholder="Add a description to your video"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>

                    <FormControl>
                      <div className="aspect-video border rounded-md border-dashed border-neutral-400 relative h-28 group">
                        <Image
                          src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                          alt="Thumbnail"
                          fill
                          className="object-cover p-1 rounded-lg"
                        />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="border-neutral-400/80 absolute top-2.5 right-2.5 rounded-full opacity-100 md:opacity-0 bg-black/50 hover:bg-black/50 group-hover:opacity-100 duration-300 size-7"
                            >
                              <MoreVerticalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="start"
                            side="right"
                            sideOffset={15}
                            alignOffset={-11}
                          >
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon />
                              Change
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                generateThumbnail.mutate({ id: videoId })
                              }
                            >
                              <SparklesIcon />
                              AI-Generate
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ id: videoId })
                              }
                            >
                              <RotateCcwIcon />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>

                <div className="flex flex-col p-4 gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Video link
                      </p>

                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={onCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Video status
                      </p>

                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || "preparing")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Subtitles status
                      </p>

                      <p className="text-sm">
                        {snakeCaseToTitle(
                          video.muxTrackStatus || "no_subtitles"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe2Icon className="size-4" />
                            Public
                          </div>
                        </SelectItem>

                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <LockIcon className="size-4" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
