import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { AccountPrincipal, Effect, Group, ManagedPolicy, PermissionsBoundary, PolicyDocument, PolicyStatement, Role, User } from 'aws-cdk-lib/lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/lib/aws-s3';
import { Condition } from 'aws-cdk-lib/lib/aws-stepfunctions';
import { Construct } from 'constructs';

export class GithubDeploymentUserStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const githubBuildActionPolicy = new ManagedPolicy(this, `GithubActionsGroupPolicy#${id}`, {
            description: "Policy for the github actions group",
            document: new PolicyDocument({
                statements: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "s3:Create*",
                            "iam:Create*",
                            "s3:Get*"
                        ],
                        resources: ['*']
                    })
                ]
            }),
            managedPolicyName: "GithubActionsPolicy"
        });
        const permissionBoundary = new ManagedPolicy(this, `CanOnlyCreateS3#${id}`, {
            description: "Boundary to only create S3 buckets",
            document: new PolicyDocument({
                statements: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "s3:Create*",
                            "iam:Create*",
                            "s3:Get*"
                        ],
                        conditions: {
                            'StringEquals': {
                                'aws:ResourceTag/service': 'GithubAction'
                            }
                        },
                        resources: [
                            '*'
                        ]
                    })
                ]
            })
        });

        const user = new Role(this, `GithubActionsUser-${id}`, {
            path: "/github/build/first/",
            roleName: "GithubActionsRole",
            permissionsBoundary: permissionBoundary,
            managedPolicies: [githubBuildActionPolicy],
            assumedBy: new AccountPrincipal(this.account)
        });

        const exampleBucket = new Bucket(this, `${id}-Bucket`, {
            bucketName: "space.smarquardt.examplebucket",
            accessControl: BucketAccessControl.PRIVATE,
            encryption: BucketEncryption.S3_MANAGED,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL
        });
        const exampleBucketWithTag = new Bucket(this, `${id}-BucketWithTags`, {
            bucketName: "space.smarquardt.examplebucketwithtags",
            accessControl: BucketAccessControl.PRIVATE,
            encryption: BucketEncryption.S3_MANAGED,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL
        });
        Tags.of(exampleBucketWithTag).add('service', 'GithubAction');


    }
}
