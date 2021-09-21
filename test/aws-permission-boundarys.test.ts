import * as cdk from 'aws-cdk-lib';
import * as AwsPermissionBoundarys from '../lib/aws-permission-boundarys-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AwsPermissionBoundarys.AwsPermissionBoundarysStack(app, 'MyTestStack');
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toEqual({});
});
