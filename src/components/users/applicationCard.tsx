// applicationCard.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { JobApplicationView } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye } from "lucide-react";

interface ApplicationCardProps {
  application: JobApplicationView;
  withdrawApplication: (applicationId: string) => void;
  onViewJob: () => void; // New prop for viewing job details
}

export function ApplicationCard({
  application,
  withdrawApplication,
  onViewJob,
}: ApplicationCardProps) {
  const appliedDate = formatDistanceToNow(new Date(application.application.appliedAt), {
    addSuffix: true,
  });

  console.log("application", application)

  const getStatusBadgeStyle = (color: string) => {
    return {
      backgroundColor: color + "20",
      color: color,
      borderColor: color,
    };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-semibold">{application.job.title}</h3>
            <p className="text-sm text-muted-foreground">
              {application.company.name} • {application.job.location}
            </p>
          </div>
          <Badge
            variant="outline"
            style={getStatusBadgeStyle(application.status.color)}
            className="w-fit px-2 py-1"
          >
            {application.status.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Job Details</h4>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Type:</span>{" "}
                {application.job.employmentType}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Category:</span>{" "}
                {application.category.name}
              </p>
              {application.job.salary && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Salary:</span>{" "}
                  {application.job.salary}
                </p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Application Info</h4>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Applied:</span>{" "}
                {appliedDate}
              </p>
              {application.resume.resumeUrl && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Resume:</span>{" "}
                <a
                  href={application.resume.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Resume
                </a>
              </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t flex flex-wrap justify-end gap-2 p-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewJob}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View Job
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={application.status.id === "withdrawn"}
            >
              Withdraw
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to withdraw your application for{" "}
                <span className="font-semibold">{application.job.title}</span> at{" "}
                <span className="font-semibold">{application.company.name}</span>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => withdrawApplication(application.application.id)}
              >
                Withdraw
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}